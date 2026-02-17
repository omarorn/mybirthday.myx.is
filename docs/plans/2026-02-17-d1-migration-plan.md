# D1 Database Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all in-memory Maps and KV-backed persistence to Cloudflare D1 (SQLite) and R2, giving the birthday portal durable storage that survives Worker restarts.

**Architecture:** Every route module currently reads/writes in-memory Maps (with optional KV backup). We replace those with D1 prepared statements and move binary blobs (selfie images, karaoke audio) to R2. KV stays for quiz question caching only.

**Tech Stack:** Cloudflare Workers, D1 (SQLite), R2, KV, Vitest, TypeScript

---

## Task 1: Create D1 database, R2 bucket, and update wrangler.toml

**Files:**
- Modify: `wrangler.toml`

**Step 1: Create D1 database via wrangler CLI**

```bash
npx wrangler d1 create its_my_birthday_db
```

Expected: Returns a database_id UUID. Save it.

**Step 2: Create R2 bucket via wrangler CLI**

```bash
npx wrangler r2 bucket create its-my-birthday-media
```

Expected: Bucket created successfully.

**Step 3: Add D1 + R2 bindings to wrangler.toml**

Add these sections to `wrangler.toml` (after existing `[[kv_namespaces]]` block):

```toml
[[d1_databases]]
binding = "DB"
database_name = "its_my_birthday_db"
database_id = "<paste-database-id-from-step-1>"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "its-my-birthday-media"
```

**Step 4: Verify wrangler recognizes new bindings**

Run: `npx wrangler d1 list`
Expected: `its_my_birthday_db` appears in the list.

**Step 5: Commit**

```bash
git add wrangler.toml
git commit -m "infra: add D1 database and R2 bucket bindings to wrangler.toml"
```

---

## Task 2: Write the migration SQL

**Files:**
- Create: `migrations/0001_initial_schema.sql`

**Step 1: Create migration file**

Create `migrations/0001_initial_schema.sql` with all 10 tables:

```sql
-- 0001_initial_schema.sql
-- D1 migration: create all tables for birthday portal

-- 1. rsvp
CREATE TABLE IF NOT EXISTS rsvp (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'sms',
  attending INTEGER DEFAULT 1,
  party_size INTEGER DEFAULT 1,
  plus_one TEXT,
  dietary TEXT,
  note TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rsvp_slug ON rsvp(slug);

-- 2. quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  answer INTEGER NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_slug ON quiz_questions(slug);

-- 3. quiz_answers
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  choice INTEGER NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_slug ON quiz_answers(slug);

-- 4. player_stats
CREATE TABLE IF NOT EXISTS player_stats (
  player_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  player_name TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  last_answer_date TEXT,
  PRIMARY KEY (player_id, slug)
);

-- 5. events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT,
  timezone TEXT DEFAULT 'Atlantic/Reykjavik',
  published INTEGER DEFAULT 0,
  metadata TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_owner ON events(owner_id);

-- 6. tenants
CREATE TABLE IF NOT EXISTS tenants (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  hashtag TEXT NOT NULL,
  instagram_handle TEXT,
  owner TEXT,
  created_at TEXT NOT NULL
);

-- 7. photos
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  source_url TEXT,
  added_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_slug ON photos(slug);

-- 8. planner_applications
CREATE TABLE IF NOT EXISTS planner_applications (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  type TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  for_guest TEXT,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_planner_slug ON planner_applications(slug);

-- 9. selfies
CREATE TABLE IF NOT EXISTS selfies (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  image_key TEXT NOT NULL,
  caption TEXT,
  submitted_by TEXT NOT NULL,
  taken_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_selfies_slug ON selfies(slug);

-- 10. karaoke_songs
CREATE TABLE IF NOT EXISTS karaoke_songs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  audio_key TEXT NOT NULL,
  lyrics TEXT,
  manual_lyrics TEXT,
  chords TEXT,
  preset INTEGER DEFAULT 0,
  duration REAL,
  added_by TEXT NOT NULL,
  status TEXT DEFAULT 'uploaded',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_karaoke_slug ON karaoke_songs(slug);
```

**Step 2: Apply migration locally**

```bash
npx wrangler d1 execute its_my_birthday_db --local --file=migrations/0001_initial_schema.sql
```

Expected: No errors. Tables created.

**Step 3: Verify tables created locally**

```bash
npx wrangler d1 execute its_my_birthday_db --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

Expected: All 10 table names listed.

**Step 4: Apply migration to remote D1**

```bash
npx wrangler d1 execute its_my_birthday_db --remote --file=migrations/0001_initial_schema.sql
```

Expected: Migration applied to production D1.

**Step 5: Commit**

```bash
git add migrations/0001_initial_schema.sql
git commit -m "db: add initial D1 schema with 10 tables for birthday portal"
```

---

## Task 3: Update Env interface and SelfieItem type

**Files:**
- Modify: `modules/mobile-app-shell/types.ts`

**Step 1: Add D1 and R2 bindings to Env interface**

In `modules/mobile-app-shell/types.ts`, change the `Env` interface from:

```typescript
export interface Env {
  QUIZ_DATA?: KVNamespace;
  ADMIN_PASSWORD?: string;
  AI?: Ai;
}
```

to:

```typescript
export interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  QUIZ_DATA?: KVNamespace;
  ADMIN_PASSWORD?: string;
  AI?: Ai;
}
```

**Step 2: Update SelfieItem — replace imageData with image_key**

Change `SelfieItem` from:

```typescript
export interface SelfieItem {
  id: string;
  imageData: string;
  caption?: string;
  submittedBy: string;
  takenAt: string;
}
```

to:

```typescript
export interface SelfieItem {
  id: string;
  slug: string;
  imageKey: string;
  caption?: string;
  submittedBy: string;
  takenAt: string;
}
```

**Step 3: Verify typecheck (expect errors in route files — that is correct at this stage)**

Run: `npm run typecheck 2>&1 | tail -20`

Expected: Errors in route files referencing `memoryStore`, `memorySelfies` etc. — this is expected since routes still import from `state.ts`. The `types.ts` file itself should have no errors.

**Step 4: Commit**

```bash
git add modules/mobile-app-shell/types.ts
git commit -m "types: add D1 and R2 bindings to Env, update SelfieItem for R2"
```

---

## Task 4: Add /media/* route to worker.ts

**Files:**
- Modify: `modules/mobile-app-shell/worker.ts`

**Step 1: Add R2 media serving route**

In `worker.ts`, add a new route handler before the HTML fallback. After the API route chain and before the `return new Response(htmlContent...)` line, add:

```typescript
    // ── Media serving from R2 ─────────────────────────
    if (path.startsWith("/media/") && method === "GET") {
      const key = path.slice(7); // strip "/media/"
      if (!key) return json({ error: "Media key vantar" }, 400);
      const object = await env.MEDIA_BUCKET.get(key);
      if (!object) return json({ error: "Skrá fannst ekki" }, 404);
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers });
    }
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "worker.ts"`
Expected: No new errors in worker.ts (env.MEDIA_BUCKET now exists in Env).

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/worker.ts
git commit -m "feat: add /media/* route for R2 object serving"
```

---

## Task 5: Migrate rsvp.ts to D1

**Files:**
- Modify: `modules/mobile-app-shell/routes/rsvp.ts`

**Step 1: Rewrite rsvp.ts**

Replace the entire file with D1-based implementation:

```typescript
/**
 * RSVP route handlers — D1 persistence.
 */

import type { Env, RsvpRecord } from "../types";
import { json, slugify, normalizeId, readStringField, parseJsonBody, isFiniteNumber } from "../helpers";

// ── Route handler ────────────────────────────────────────────────

export async function handleRsvpRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/rsvp" && request.method === "POST") {
    const body = await parseJsonBody(request);
    const name = readStringField(body, "name");
    const contact = readStringField(body, "contact");
    if (!name || !contact) {
      return json({ error: "Nafn og samskiptaupplýsingar vantar" }, 400);
    }
    const slug = slugify((body.slug as string) || "omars50");
    const method = (body.method === "google" ? "google" : "sms") as "sms" | "google";
    const attending = body.attending !== false;
    const partySize = isFiniteNumber(body.partySize) ? (body.partySize as number) : 1;
    const plusOne = typeof body.plusOne === "string" ? body.plusOne : undefined;
    const dietary = typeof body.dietary === "string" ? body.dietary : undefined;
    const note = typeof body.note === "string" ? body.note : undefined;

    const id = normalizeId(name + contact);
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO rsvp (id, slug, name, contact, method, attending, party_size, plus_one, dietary, note, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         contact = excluded.contact,
         method = excluded.method,
         attending = excluded.attending,
         party_size = excluded.party_size,
         plus_one = excluded.plus_one,
         dietary = excluded.dietary,
         note = excluded.note,
         updated_at = excluded.updated_at`
    )
      .bind(id, slug, name, contact, method, attending ? 1 : 0, partySize, plusOne ?? null, dietary ?? null, note ?? null, now)
      .run();

    return json({
      success: true,
      record: { id, slug, name, contact, method, attending, partySize, plusOne, dietary, note, updatedAt: now },
    }, 201);
  }

  if (url.pathname === "/api/rsvp/stats" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const stats = await env.DB.prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN attending = 1 THEN 1 ELSE 0 END) as attending,
         SUM(CASE WHEN attending = 1 THEN party_size ELSE 0 END) as total_guests
       FROM rsvp WHERE slug = ?`
    ).bind(slug).first<{ total: number; attending: number; total_guests: number }>();

    return json({
      slug,
      total: stats?.total ?? 0,
      attending: stats?.attending ?? 0,
      totalGuests: stats?.total_guests ?? 0,
    });
  }

  return null;
}

// ── Exported loader for admin ────────────────────────────────────

export async function loadAllRsvps(env: Env, slug: string): Promise<RsvpRecord[]> {
  const results = await env.DB.prepare(
    "SELECT * FROM rsvp WHERE slug = ? ORDER BY updated_at DESC"
  ).bind(slug).all<{
    id: string; slug: string; name: string; contact: string; method: string;
    attending: number; party_size: number; plus_one: string | null;
    dietary: string | null; note: string | null; updated_at: string;
  }>();
  return results.results.map((r) => ({
    id: r.id,
    name: r.name,
    contact: r.contact,
    method: r.method as "sms" | "google",
    attending: r.attending === 1,
    partySize: r.party_size,
    plusOne: r.plus_one ?? undefined,
    dietary: r.dietary ?? undefined,
    note: r.note ?? undefined,
    updatedAt: r.updated_at,
  }));
}
```

**Step 2: Remove state.ts import from rsvp.ts**

Ensure the file no longer imports anything from `../state`.

**Step 3: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "rsvp.ts"`
Expected: No errors in rsvp.ts.

**Step 4: Commit**

```bash
git add modules/mobile-app-shell/routes/rsvp.ts
git commit -m "feat: migrate rsvp.ts from in-memory Maps to D1"
```

---

## Task 6: Migrate hosting.ts to D1

**Files:**
- Modify: `modules/mobile-app-shell/routes/hosting.ts`

**Step 1: Rewrite hosting.ts**

```typescript
/**
 * Hosting/tenant signup route handlers — D1 persistence.
 */

import type { Env, TenantConfig } from "../types";
import { json, slugify, readStringField, parseJsonBody } from "../helpers";

// ── Route handler ────────────────────────────────────────────────

export async function handleHostingRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/hosting/signup" && request.method === "POST") {
    const body = await parseJsonBody(request);
    const title = readStringField(body, "title");
    if (!title || title.length < 3) {
      return json({ error: "Titill verður að vera a.m.k. 3 stafir" }, 400);
    }
    const slug = slugify(title);
    const existing = await env.DB.prepare(
      "SELECT slug FROM tenants WHERE slug = ?"
    ).bind(slug).first();
    if (existing) {
      return json({ error: "Þessi slug er þegar í notkun" }, 409);
    }
    const hashtag = typeof body.hashtag === "string" ? body.hashtag : `#${slug}`;
    const instagramHandle = typeof body.instagramHandle === "string" ? body.instagramHandle : undefined;
    const owner = typeof body.owner === "string" ? body.owner : undefined;
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO tenants (slug, title, hashtag, instagram_handle, owner, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(slug, title, hashtag, instagramHandle ?? null, owner ?? null, now).run();

    return json({ success: true, slug }, 201);
  }

  if (url.pathname === "/api/hosting/tenant" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "");
    if (!slug) return json({ error: "slug vantar" }, 400);
    const row = await env.DB.prepare(
      "SELECT * FROM tenants WHERE slug = ?"
    ).bind(slug).first<{
      slug: string; title: string; hashtag: string;
      instagram_handle: string | null; owner: string | null; created_at: string;
    }>();
    if (!row) return json({ error: "Tenant fannst ekki" }, 404);
    const tenant: TenantConfig = {
      slug: row.slug,
      title: row.title,
      hashtag: row.hashtag,
      instagramHandle: row.instagram_handle ?? undefined,
      owner: row.owner ?? undefined,
      createdAt: row.created_at,
    };
    return json(tenant);
  }

  return null;
}

export async function loadTenant(env: Env, slug: string): Promise<TenantConfig | null> {
  const row = await env.DB.prepare(
    "SELECT * FROM tenants WHERE slug = ?"
  ).bind(slug).first<{
    slug: string; title: string; hashtag: string;
    instagram_handle: string | null; owner: string | null; created_at: string;
  }>();
  if (!row) return null;
  return {
    slug: row.slug,
    title: row.title,
    hashtag: row.hashtag,
    instagramHandle: row.instagram_handle ?? undefined,
    owner: row.owner ?? undefined,
    createdAt: row.created_at,
  };
}
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "hosting.ts"`
Expected: No errors.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/hosting.ts
git commit -m "feat: migrate hosting.ts from in-memory Maps to D1"
```

---

## Task 7: Migrate photowall.ts to D1

**Files:**
- Modify: `modules/mobile-app-shell/routes/photowall.ts`

**Step 1: Rewrite photowall.ts**

```typescript
/**
 * Photo wall route handlers — D1 persistence.
 */

import type { Env, PhotoWallItem } from "../types";
import { json, slugify, readStringField, parseJsonBody, isAdmin, isValidHttpUrl } from "../helpers";

// ── Route handler ────────────────────────────────────────────────

export async function handlePhotoWallRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/photowall" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const photos = await loadPhotoWall(env, slug);
    return json({ slug, total: photos.length, photos });
  }

  if (url.pathname === "/api/photowall/item" && request.method === "POST") {
    if (!isAdmin(request, env)) {
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    }
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = await parseJsonBody(request);
    const imageUrl = readStringField(body, "imageUrl");
    if (!imageUrl || !isValidHttpUrl(imageUrl)) {
      return json({ error: "Gilt imageUrl vantar" }, 400);
    }
    const caption = typeof body.caption === "string" ? body.caption : undefined;
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl : undefined;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO photos (id, slug, image_url, caption, source_url, added_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, slug, imageUrl, caption ?? null, sourceUrl ?? null, now).run();

    return json({ success: true, id }, 201);
  }

  if (url.pathname === "/api/photowall/item" && request.method === "DELETE") {
    if (!isAdmin(request, env)) {
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    }
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const result = await env.DB.prepare(
      "DELETE FROM photos WHERE id = ?"
    ).bind(id).run();
    if (result.meta.changes === 0) {
      return json({ error: "Mynd fannst ekki" }, 404);
    }
    return json({ success: true, deleted: id });
  }

  return null;
}

export async function loadPhotoWall(env: Env, slug: string): Promise<PhotoWallItem[]> {
  const results = await env.DB.prepare(
    "SELECT * FROM photos WHERE slug = ? ORDER BY added_at DESC"
  ).bind(slug).all<{
    id: string; slug: string; image_url: string;
    caption: string | null; source_url: string | null; added_at: string;
  }>();
  return results.results.map((r) => ({
    id: r.id,
    slug: r.slug,
    imageUrl: r.image_url,
    caption: r.caption ?? undefined,
    sourceUrl: r.source_url ?? undefined,
    addedAt: r.added_at,
  }));
}
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "photowall.ts"`
Expected: No errors.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/photowall.ts
git commit -m "feat: migrate photowall.ts from in-memory Maps to D1"
```

---

## Task 8: Migrate planner.ts to D1

**Files:**
- Modify: `modules/mobile-app-shell/routes/planner.ts`

**Step 1: Rewrite planner.ts**

```typescript
/**
 * Planner application route handlers — D1 persistence.
 */

import type { Env, PlannerApplication } from "../types";
import { json, slugify, readStringField, parseJsonBody } from "../helpers";

// ── Route handler ────────────────────────────────────────────────

export async function handlePlannerRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/planner/apply" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = await parseJsonBody(request);
    const applicantName = readStringField(body, "applicantName");
    const contact = readStringField(body, "contact");
    const note = readStringField(body, "note");
    if (!applicantName || !contact || !note) {
      return json({ error: "applicantName, contact og note eru nauðsynleg" }, 400);
    }
    const type = body.type === "surprise_help" ? "surprise_help" : "host_add";
    const forGuest = typeof body.forGuest === "string" ? body.forGuest : undefined;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO planner_applications (id, slug, type, applicant_name, contact, for_guest, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, slug, type, applicantName, contact, forGuest ?? null, note, now).run();

    return json({ success: true, id }, 201);
  }

  if (url.pathname === "/api/planner/applications" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const apps = await loadPlannerApplications(env, slug);
    return json({ slug, total: apps.length, applications: apps });
  }

  return null;
}

export async function loadPlannerApplications(env: Env, slug: string): Promise<PlannerApplication[]> {
  const results = await env.DB.prepare(
    "SELECT * FROM planner_applications WHERE slug = ? ORDER BY created_at DESC"
  ).bind(slug).all<{
    id: string; slug: string; type: string; applicant_name: string;
    contact: string; for_guest: string | null; note: string; created_at: string;
  }>();
  return results.results.map((r) => ({
    id: r.id,
    slug: r.slug,
    type: r.type as "host_add" | "surprise_help",
    applicantName: r.applicant_name,
    contact: r.contact,
    forGuest: r.for_guest ?? undefined,
    note: r.note,
    createdAt: r.created_at,
  }));
}
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "planner.ts"`
Expected: No errors.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/planner.ts
git commit -m "feat: migrate planner.ts from in-memory Maps to D1"
```

---

## Task 9: Migrate selfie.ts to D1 + R2

**Files:**
- Modify: `modules/mobile-app-shell/routes/selfie.ts`

**Step 1: Rewrite selfie.ts**

```typescript
/**
 * Selfie booth route handlers — D1 metadata + R2 images.
 */

import type { Env, SelfieItem } from "../types";
import { json, slugify, readStringField, parseJsonBody, isAdmin } from "../helpers";

// ── Route handler ────────────────────────────────────────────────

export async function handleSelfieRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/selfie/list" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const selfies = await loadSelfies(env, slug);
    return json({
      slug,
      total: selfies.length,
      selfies: selfies.map((s) => ({
        id: s.id,
        imageUrl: `/media/${s.imageKey}`,
        caption: s.caption,
        submittedBy: s.submittedBy,
        takenAt: s.takenAt,
      })),
    });
  }

  if (url.pathname === "/api/selfie/capture" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = await parseJsonBody(request);
    const imageData = readStringField(body, "imageData");
    const submittedBy = readStringField(body, "submittedBy");
    if (!imageData || !submittedBy) {
      return json({ error: "imageData og submittedBy vantar" }, 400);
    }
    if (imageData.length > 5_000_000) {
      return json({ error: "Mynd of stór (hámark ~3.7MB)" }, 400);
    }

    const id = crypto.randomUUID();
    const imageKey = `selfies/${slug}/${id}.jpg`;
    const caption = typeof body.caption === "string" ? body.caption : undefined;
    const now = new Date().toISOString();

    // Decode base64 and upload to R2
    const raw = imageData.includes(",") ? imageData.split(",")[1] : imageData;
    const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
    await env.MEDIA_BUCKET.put(imageKey, bytes, {
      httpMetadata: { contentType: "image/jpeg" },
    });

    // Save metadata to D1
    await env.DB.prepare(
      `INSERT INTO selfies (id, slug, image_key, caption, submitted_by, taken_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, slug, imageKey, caption ?? null, submittedBy, now).run();

    return json({
      success: true,
      selfie: { id, imageUrl: `/media/${imageKey}`, caption, submittedBy, takenAt: now },
    }, 201);
  }

  if (url.pathname === "/api/selfie/item" && request.method === "DELETE") {
    if (!isAdmin(request, env)) {
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    }
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);

    // Get image key before deleting
    const row = await env.DB.prepare(
      "SELECT image_key FROM selfies WHERE id = ?"
    ).bind(id).first<{ image_key: string }>();
    if (!row) return json({ error: "Selfie fannst ekki" }, 404);

    // Delete from R2 and D1
    await env.MEDIA_BUCKET.delete(row.image_key);
    await env.DB.prepare("DELETE FROM selfies WHERE id = ?").bind(id).run();

    return json({ success: true, deleted: id });
  }

  return null;
}

export async function loadSelfies(env: Env, slug: string): Promise<SelfieItem[]> {
  const results = await env.DB.prepare(
    "SELECT * FROM selfies WHERE slug = ? ORDER BY taken_at DESC"
  ).bind(slug).all<{
    id: string; slug: string; image_key: string;
    caption: string | null; submitted_by: string; taken_at: string;
  }>();
  return results.results.map((r) => ({
    id: r.id,
    slug: r.slug,
    imageKey: r.image_key,
    caption: r.caption ?? undefined,
    submittedBy: r.submitted_by,
    takenAt: r.taken_at,
  }));
}
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "selfie.ts"`
Expected: No errors.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/selfie.ts
git commit -m "feat: migrate selfie.ts from in-memory/KV to D1+R2"
```

---

## Task 10: Migrate karaoke.ts to D1 + R2

**Files:**
- Modify: `modules/mobile-app-shell/routes/karaoke.ts`

**Step 1: Rewrite karaoke.ts**

```typescript
/**
 * MyKaraoke route handlers — D1 metadata + R2 audio.
 */

import type { Env, KaraokeSong, TranscriptSegment } from "../types";
import { json, slugify, isAdmin, readStringField, parseJsonBody } from "../helpers";

function presetKaraokeSongs(): Array<{
  id: string; slug: string; title: string; artist: string; audio_key: string;
  manual_lyrics: string; chords: string; preset: number; added_by: string;
  status: string; created_at: string;
}> {
  return [
    {
      id: "preset-hann-a-afmaeli-i-dag",
      slug: "omars50",
      title: "Hann á afmæli í dag",
      artist: "Afmæliskórinn",
      audio_key: "",
      manual_lyrics: [
        "Hann á afmæli í dag, hann á afmæli í dag,",
        "hann á afmæli hann Omar, hann á afmæli í dag!",
        "Húrra! Húrra! Húrra!",
      ].join("\n"),
      chords: JSON.stringify(["G", "D", "Em", "C", "G", "D", "G"]),
      preset: 1,
      added_by: "System",
      status: "ready",
      created_at: "2026-02-17T00:00:00.000Z",
    },
  ];
}

async function ensurePresets(env: Env): Promise<void> {
  for (const preset of presetKaraokeSongs()) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO karaoke_songs
       (id, slug, title, artist, audio_key, manual_lyrics, chords, preset, added_by, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      preset.id, preset.slug, preset.title, preset.artist, preset.audio_key,
      preset.manual_lyrics, preset.chords, preset.preset, preset.added_by,
      preset.status, preset.created_at,
    ).run();
  }
}

function rowToSong(r: Record<string, unknown>): KaraokeSong {
  return {
    id: r.id as string,
    title: r.title as string,
    artist: (r.artist as string) ?? undefined,
    audioKey: r.audio_key as string,
    lyrics: r.lyrics ? JSON.parse(r.lyrics as string) as TranscriptSegment[] : undefined,
    manualLyrics: (r.manual_lyrics as string) ?? undefined,
    chords: r.chords ? JSON.parse(r.chords as string) as string[] : undefined,
    preset: (r.preset as number) === 1,
    duration: (r.duration as number) ?? undefined,
    addedBy: r.added_by as string,
    createdAt: r.created_at as string,
    status: r.status as KaraokeSong["status"],
  };
}

// ── Route handler ────────────────────────────────────────────────

export async function handleKaraokeRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/karaoke/songs" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    await ensurePresets(env);
    const results = await env.DB.prepare(
      "SELECT * FROM karaoke_songs WHERE slug = ? ORDER BY created_at ASC"
    ).bind(slug).all();
    const songs = results.results.map(rowToSong);
    return json({
      slug,
      total: songs.length,
      songs: songs.map((song) => ({
        ...song,
        audioKey: undefined,
        hasAudio: Boolean(song.audioKey),
      })),
    });
  }

  if (url.pathname === "/api/karaoke/song" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    await ensurePresets(env);
    const row = await env.DB.prepare(
      "SELECT * FROM karaoke_songs WHERE id = ? AND slug = ?"
    ).bind(id, slug).first();
    if (!row) return json({ error: "Lag fannst ekki" }, 404);
    const song = rowToSong(row as Record<string, unknown>);
    return json({ ...song, audioKey: undefined, hasAudio: Boolean(song.audioKey) });
  }

  if (url.pathname === "/api/karaoke/audio" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const row = await env.DB.prepare(
      "SELECT audio_key FROM karaoke_songs WHERE id = ? AND slug = ?"
    ).bind(id, slug).first<{ audio_key: string }>();
    if (!row) return json({ error: "Lag fannst ekki" }, 404);
    if (!row.audio_key) return json({ error: "Preset lag hefur enga hljóðskrá" }, 404);

    const object = await env.MEDIA_BUCKET.get(row.audio_key);
    if (!object) return json({ error: "Hljóðskrá fannst ekki" }, 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=86400");
    return new Response(object.body, { headers });
  }

  if (url.pathname === "/api/karaoke/upload" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = await parseJsonBody(request);
    const title = readStringField(body, "title");
    const addedBy = readStringField(body, "addedBy");
    const audioBase64 = readStringField(body, "audioBase64");
    if (!title || !addedBy || !audioBase64) {
      return json({ error: "title, addedBy og audioBase64 eru nauðsynleg" }, 400);
    }
    if (audioBase64.length > 14_000_000) {
      return json({ error: "Hljóðskrá of stór (hámark ~10MB)" }, 400);
    }

    const id = crypto.randomUUID();
    const audioKey = `karaoke/${slug}/${id}.webm`;
    const artist = typeof body.artist === "string" ? body.artist : "";
    const now = new Date().toISOString();

    // Upload audio to R2
    const raw = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;
    const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
    await env.MEDIA_BUCKET.put(audioKey, bytes, {
      httpMetadata: { contentType: "audio/webm" },
    });

    // Save metadata to D1
    await env.DB.prepare(
      `INSERT INTO karaoke_songs (id, slug, title, artist, audio_key, added_by, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, slug, title, artist, audioKey, addedBy, "uploaded", now).run();

    return json({ success: true, song: { id, title, artist, addedBy, createdAt: now, status: "uploaded" } }, 201);
  }

  if (url.pathname === "/api/karaoke/transcribe" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    if (!env.AI) return json({ error: "AI binding ekki stillt" }, 500);

    const row = await env.DB.prepare(
      "SELECT audio_key FROM karaoke_songs WHERE id = ? AND slug = ?"
    ).bind(id, slug).first<{ audio_key: string }>();
    if (!row) return json({ error: "Lag fannst ekki" }, 404);

    // Update status to transcribing
    await env.DB.prepare(
      "UPDATE karaoke_songs SET status = 'transcribing' WHERE id = ?"
    ).bind(id).run();

    try {
      const object = await env.MEDIA_BUCKET.get(row.audio_key);
      if (!object) {
        await env.DB.prepare("UPDATE karaoke_songs SET status = 'error' WHERE id = ?").bind(id).run();
        return json({ error: "Hljóðskrá fannst ekki" }, 404);
      }
      const arrayBuf = await object.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);

      const result = (await env.AI.run("@cf/openai/whisper", {
        audio: [...bytes],
      })) as { text?: string; words?: { word: string; start: number; end: number }[] };

      const segments: TranscriptSegment[] = result.words
        ? result.words.map((w) => ({ word: w.word, start: w.start, end: w.end }))
        : (result.text || "")
            .split(/\s+/)
            .filter(Boolean)
            .map((w, i) => ({ word: w, start: i * 0.5, end: i * 0.5 + 0.4 }));

      await env.DB.prepare(
        "UPDATE karaoke_songs SET lyrics = ?, status = 'ready' WHERE id = ?"
      ).bind(JSON.stringify(segments), id).run();

      return json({ success: true, segmentCount: segments.length });
    } catch (err) {
      await env.DB.prepare("UPDATE karaoke_songs SET status = 'error' WHERE id = ?").bind(id).run();
      return json({ error: "Umritun mistókst", detail: String(err) }, 500);
    }
  }

  if (url.pathname === "/api/karaoke/lyrics" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const body = await parseJsonBody(request);
    const lyrics = readStringField(body, "lyrics");
    if (!lyrics) return json({ error: "lyrics vantar" }, 400);

    const existing = await env.DB.prepare(
      "SELECT status FROM karaoke_songs WHERE id = ? AND slug = ?"
    ).bind(id, slug).first<{ status: string }>();
    if (!existing) return json({ error: "Lag fannst ekki" }, 404);

    const newStatus = existing.status === "uploaded" ? "ready" : existing.status;
    await env.DB.prepare(
      "UPDATE karaoke_songs SET manual_lyrics = ?, status = ? WHERE id = ?"
    ).bind(lyrics, newStatus, id).run();

    return json({ success: true });
  }

  if (url.pathname === "/api/karaoke/song" && request.method === "DELETE") {
    if (!isAdmin(request, env)) return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);

    const row = await env.DB.prepare(
      "SELECT audio_key, preset FROM karaoke_songs WHERE id = ? AND slug = ?"
    ).bind(id, slug).first<{ audio_key: string; preset: number }>();
    if (!row) return json({ error: "Lag fannst ekki" }, 404);
    if (row.preset === 1) return json({ error: "Ekki má eyða preset lagi" }, 400);

    // Delete audio from R2 and metadata from D1
    if (row.audio_key) await env.MEDIA_BUCKET.delete(row.audio_key);
    await env.DB.prepare("DELETE FROM karaoke_songs WHERE id = ?").bind(id).run();

    return json({ success: true, deleted: id });
  }

  return null;
}
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "karaoke.ts"`
Expected: No errors.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/karaoke.ts
git commit -m "feat: migrate karaoke.ts from in-memory/KV to D1+R2"
```

---

## Task 11: Migrate quiz.ts to D1 (most complex)

**Files:**
- Modify: `modules/mobile-app-shell/routes/quiz.ts`

This is the largest migration. The quiz module uses 4+ data sources:
- `memoryCustomQuestions` → `quiz_questions` table
- Quiz summary (computed) → computed from `quiz_answers`
- Recent answers → `quiz_answers` table
- Player stats → `player_stats` table

**Step 1: Rewrite quiz.ts**

Due to the length and complexity of this file (~477 lines → ~500 lines), the rewrite should preserve all existing route signatures and gamification logic while replacing Map operations with D1 prepared statements.

Key changes:
- `loadCustomQuestions(env, slug)` → `SELECT * FROM quiz_questions WHERE slug = ?`
- `saveCustomQuestion(env, slug, q)` → `INSERT INTO quiz_questions`
- `deleteCustomQuestion(env, slug, id)` → `DELETE FROM quiz_questions WHERE id = ? AND slug = ?`
- `getQuizSummary(env, slug)` → `SELECT question_id, COUNT(*) as total, SUM(correct) as correct_count FROM quiz_answers WHERE slug = ? GROUP BY question_id`
- `saveQuizAnswer(env, slug, answer)` → `INSERT INTO quiz_answers`
- `loadPlayerStats(env, slug, playerId)` → `SELECT * FROM player_stats WHERE player_id = ? AND slug = ?`
- `savePlayerStats(env, slug, stats)` → `INSERT OR REPLACE INTO player_stats`
- `loadLeaderboard(env, slug)` → `SELECT * FROM player_stats WHERE slug = ? ORDER BY total_points DESC LIMIT 50`

The gamification helpers (`updatePlayerStreak`, `calculatePointsEarned`) are pure functions and remain unchanged.

```typescript
/**
 * Quiz route handlers — D1 persistence.
 */

import type { Env, QuizSummary, QuizRecentAnswer, PlayerStats } from "../types";
import { type QuizQuestion } from "../quizData";
import { json, slugify, parseJsonBody, isFiniteNumber, sanitizeQuestions, isAdmin } from "../helpers";

// ── Gamification helpers (pure functions, unchanged) ─────────────

function calculatePointsEarned(correct: boolean, streak: number): number {
  if (!correct) return 0;
  const base = 10;
  const streakBonus = Math.min(streak, 10) * 2;
  return base + streakBonus;
}

function updatePlayerStreak(stats: PlayerStats, correct: boolean): PlayerStats {
  const currentStreak = correct ? stats.currentStreak + 1 : 0;
  const bestStreak = Math.max(stats.bestStreak, currentStreak);
  return { ...stats, currentStreak, bestStreak };
}

// ── D1 persistence helpers ──────────────────────────────────────

async function loadCustomQuestions(env: Env, slug: string): Promise<QuizQuestion[]> {
  const results = await env.DB.prepare(
    "SELECT * FROM quiz_questions WHERE slug = ? ORDER BY id ASC"
  ).bind(slug).all<{
    id: number; slug: string; question: string; options: string;
    answer: number; category: string | null; created_at: string;
  }>();
  return results.results.map((r) => ({
    id: r.id,
    question: r.question,
    options: JSON.parse(r.options) as string[],
    answer: r.answer,
    category: r.category ?? undefined,
  }));
}

async function loadQuizSummary(env: Env, slug: string): Promise<QuizSummary> {
  const totals = await env.DB.prepare(
    "SELECT COUNT(*) as total_answers, SUM(correct) as total_correct FROM quiz_answers WHERE slug = ?"
  ).bind(slug).first<{ total_answers: number; total_correct: number }>();

  const byQuestion = await env.DB.prepare(
    `SELECT question_id, COUNT(*) as total, SUM(correct) as correct_count, choice
     FROM quiz_answers WHERE slug = ? GROUP BY question_id, choice`
  ).bind(slug).all<{ question_id: number; total: number; correct_count: number; choice: number }>();

  const questionStats: QuizSummary["questionStats"] = {};
  for (const row of byQuestion.results) {
    const qid = String(row.question_id);
    if (!questionStats[qid]) {
      questionStats[qid] = { total: 0, correct: 0, optionCounts: [] };
    }
    questionStats[qid].total += row.total;
    questionStats[qid].correct += row.correct_count;
    if (!questionStats[qid].optionCounts[row.choice]) {
      questionStats[qid].optionCounts[row.choice] = 0;
    }
    questionStats[qid].optionCounts[row.choice] += row.total;
  }

  return {
    totalAnswers: totals?.total_answers ?? 0,
    totalCorrect: totals?.total_correct ?? 0,
    questionStats,
  };
}

async function loadRecentAnswers(env: Env, slug: string, limit = 50): Promise<QuizRecentAnswer[]> {
  const results = await env.DB.prepare(
    "SELECT * FROM quiz_answers WHERE slug = ? ORDER BY created_at DESC LIMIT ?"
  ).bind(slug, limit).all<{
    id: number; slug: string; player_id: string; player_name: string;
    question_id: number; choice: number; correct: number; created_at: string;
  }>();
  return results.results.map((r) => ({
    ts: r.created_at,
    questionId: r.question_id,
    choice: r.choice,
    correct: r.correct === 1,
    playerId: r.player_id,
    playerName: r.player_name,
  }));
}

async function loadPlayerStats(env: Env, slug: string, playerId: string): Promise<PlayerStats | null> {
  const row = await env.DB.prepare(
    "SELECT * FROM player_stats WHERE player_id = ? AND slug = ?"
  ).bind(playerId, slug).first<{
    player_id: string; slug: string; player_name: string;
    total_points: number; current_streak: number; best_streak: number;
    total_answers: number; total_correct: number; last_answer_date: string | null;
  }>();
  if (!row) return null;
  return {
    playerId: row.player_id,
    playerName: row.player_name,
    totalPoints: row.total_points,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    totalAnswers: row.total_answers,
    totalCorrect: row.total_correct,
    lastAnswerDate: row.last_answer_date,
  };
}

async function savePlayerStats(env: Env, slug: string, stats: PlayerStats): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO player_stats (player_id, slug, player_name, total_points, current_streak, best_streak, total_answers, total_correct, last_answer_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(player_id, slug) DO UPDATE SET
       player_name = excluded.player_name,
       total_points = excluded.total_points,
       current_streak = excluded.current_streak,
       best_streak = excluded.best_streak,
       total_answers = excluded.total_answers,
       total_correct = excluded.total_correct,
       last_answer_date = excluded.last_answer_date`
  ).bind(
    stats.playerId, slug, stats.playerName,
    stats.totalPoints, stats.currentStreak, stats.bestStreak,
    stats.totalAnswers, stats.totalCorrect, stats.lastAnswerDate,
  ).run();
}

// ── Route handler ────────────────────────────────────────────────

export async function handleQuizRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  // GET /api/quiz/questions — fetch questions from KV cache + custom D1 questions
  if (url.pathname === "/api/quiz/questions" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    let baseQuestions: QuizQuestion[] = [];
    if (env.QUIZ_DATA) {
      const raw = await env.QUIZ_DATA.get("quiz:questions");
      if (raw) {
        try { baseQuestions = sanitizeQuestions(JSON.parse(raw)); } catch { /* ignore */ }
      }
    }
    const custom = await loadCustomQuestions(env, slug);
    const all = [...baseQuestions, ...custom];
    return json({ slug, total: all.length, questions: all });
  }

  // GET /api/quiz/question — fetch single question by id
  if (url.pathname === "/api/quiz/question" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = Number(url.searchParams.get("id"));
    if (!isFiniteNumber(id)) return json({ error: "Ógilt id" }, 400);

    let baseQuestions: QuizQuestion[] = [];
    if (env.QUIZ_DATA) {
      const raw = await env.QUIZ_DATA.get("quiz:questions");
      if (raw) {
        try { baseQuestions = sanitizeQuestions(JSON.parse(raw)); } catch { /* ignore */ }
      }
    }
    const custom = await loadCustomQuestions(env, slug);
    const all = [...baseQuestions, ...custom];
    const question = all.find((q) => q.id === id);
    if (!question) return json({ error: "Spurning fannst ekki" }, 404);
    return json(question);
  }

  // POST /api/quiz/answer — submit an answer
  if (url.pathname === "/api/quiz/answer" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = await parseJsonBody(request);
    const questionId = body.questionId as number;
    const choice = body.choice as number;
    const playerId = (body.playerId as string) || "anon";
    const playerName = (body.playerName as string) || "Gestur";
    if (!isFiniteNumber(questionId) || !isFiniteNumber(choice)) {
      return json({ error: "questionId og choice vantar" }, 400);
    }

    // Load all questions to check correctness
    let baseQuestions: QuizQuestion[] = [];
    if (env.QUIZ_DATA) {
      const raw = await env.QUIZ_DATA.get("quiz:questions");
      if (raw) {
        try { baseQuestions = sanitizeQuestions(JSON.parse(raw)); } catch { /* ignore */ }
      }
    }
    const custom = await loadCustomQuestions(env, slug);
    const all = [...baseQuestions, ...custom];
    const question = all.find((q) => q.id === questionId);

    if (!question) return json({ error: "Spurning fannst ekki" }, 404);
    if (choice < 0 || choice >= question.options.length) {
      return json({ error: "Ógilt val" }, 400);
    }

    const correct = choice === question.answer;
    const now = new Date().toISOString();

    // Save answer to D1
    await env.DB.prepare(
      `INSERT INTO quiz_answers (slug, player_id, player_name, question_id, choice, correct, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(slug, playerId, playerName, questionId, choice, correct ? 1 : 0, now).run();

    // Update player stats with gamification
    let stats = await loadPlayerStats(env, slug, playerId);
    if (!stats) {
      stats = {
        playerId, playerName,
        totalPoints: 0, currentStreak: 0, bestStreak: 0,
        totalAnswers: 0, totalCorrect: 0, lastAnswerDate: null,
      };
    }
    stats = updatePlayerStreak(stats, correct);
    const pointsEarned = calculatePointsEarned(correct, stats.currentStreak);
    stats.totalPoints += pointsEarned;
    stats.totalAnswers += 1;
    if (correct) stats.totalCorrect += 1;
    stats.lastAnswerDate = now;
    stats.playerName = playerName;
    await savePlayerStats(env, slug, stats);

    return json({
      correct,
      correctAnswer: question.answer,
      pointsEarned,
      streak: stats.currentStreak,
      totalPoints: stats.totalPoints,
    });
  }

  // GET /api/quiz/leaderboard
  if (url.pathname === "/api/quiz/leaderboard" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const results = await env.DB.prepare(
      "SELECT * FROM player_stats WHERE slug = ? ORDER BY total_points DESC LIMIT 50"
    ).bind(slug).all<{
      player_id: string; slug: string; player_name: string;
      total_points: number; current_streak: number; best_streak: number;
      total_answers: number; total_correct: number; last_answer_date: string | null;
    }>();

    const leaderboard = results.results.map((r) => ({
      playerId: r.player_id,
      playerName: r.player_name,
      totalPoints: r.total_points,
      currentStreak: r.current_streak,
      bestStreak: r.best_streak,
      totalAnswers: r.total_answers,
      totalCorrect: r.total_correct,
      accuracy: r.total_answers > 0 ? Math.round((r.total_correct / r.total_answers) * 100) : 0,
    }));

    return json({ slug, leaderboard });
  }

  // GET /api/quiz/player
  if (url.pathname === "/api/quiz/player" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const playerId = url.searchParams.get("playerId");
    if (!playerId) return json({ error: "playerId vantar" }, 400);
    const stats = await loadPlayerStats(env, slug, playerId);
    if (!stats) return json({ error: "Leikmaður fannst ekki" }, 404);
    return json(stats);
  }

  // GET /api/quiz/stats
  if (url.pathname === "/api/quiz/stats" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const summary = await loadQuizSummary(env, slug);
    const recent = await loadRecentAnswers(env, slug, 20);
    return json({ slug, summary, recentAnswers: recent });
  }

  // POST /api/quiz/admin/question — add custom question
  if (url.pathname === "/api/quiz/admin/question" && request.method === "POST") {
    if (!isAdmin(request, env)) return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = await parseJsonBody(request);
    const question = body.question as string;
    const options = body.options as string[];
    const answer = body.answer as number;
    const category = typeof body.category === "string" ? body.category : undefined;

    if (!question || !Array.isArray(options) || options.length < 2 || !isFiniteNumber(answer)) {
      return json({ error: "question, options (array) og answer vantar" }, 400);
    }
    if (answer < 0 || answer >= options.length) {
      return json({ error: "answer út fyrir svið" }, 400);
    }

    const id = body.id && isFiniteNumber(body.id) ? (body.id as number) : Date.now();
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO quiz_questions (id, slug, question, options, answer, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         question = excluded.question,
         options = excluded.options,
         answer = excluded.answer,
         category = excluded.category`
    ).bind(id, slug, question, JSON.stringify(options), answer, category ?? null, now).run();

    return json({ success: true, id }, 201);
  }

  // DELETE /api/quiz/admin/question
  if (url.pathname === "/api/quiz/admin/question" && request.method === "DELETE") {
    if (!isAdmin(request, env)) return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = Number(url.searchParams.get("id"));
    if (!isFiniteNumber(id)) return json({ error: "Ógilt id" }, 400);

    const result = await env.DB.prepare(
      "DELETE FROM quiz_questions WHERE id = ? AND slug = ?"
    ).bind(id, slug).run();
    if (result.meta.changes === 0) {
      return json({ error: "Spurning fannst ekki" }, 404);
    }
    return json({ success: true, deleted: id });
  }

  return null;
}

// ── Exported for admin ───────────────────────────────────────────

export { loadQuizSummary, loadRecentAnswers };
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "quiz.ts"`
Expected: No errors in quiz.ts.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/quiz.ts
git commit -m "feat: migrate quiz.ts from in-memory Maps to D1 with gamification"
```

---

## Task 12: Migrate events.ts to D1

**Files:**
- Modify: `modules/mobile-app-shell/routes/events.ts`

This module uses 3 Maps (`memoryEvents`, `memoryEventSlugIndex`, `memoryOwnerEventIds`). With D1, these are all replaced by SQL queries with indexed slug/owner_id columns.

**Step 1: Rewrite events.ts**

The key simplification: the 3 separate Maps for event lookup by ID, by slug, and by owner are replaced by SQL queries with `WHERE` clauses on indexed columns. The `buildEventRecord()` validation helper stays as-is.

Due to the length (~470 lines), the key pattern changes are:

- `memoryEvents.get(id)` → `SELECT * FROM events WHERE id = ?`
- `memoryEventSlugIndex.get(slug)` → `SELECT * FROM events WHERE slug = ?`
- `memoryOwnerEventIds.get(ownerId)` → `SELECT * FROM events WHERE owner_id = ?`
- `memoryEvents.set(id, event)` → `INSERT INTO events ... ON CONFLICT(id) DO UPDATE`
- Clone event → `INSERT INTO events` with new ID

The full rewrite should preserve all route signatures:
- POST `/api/events/create`
- POST `/api/events/clone`
- GET `/api/events/dashboard/me`
- GET `/api/events/public`

```typescript
/**
 * Events route handlers — D1 persistence.
 */

import type { Env, EventRecord } from "../types";
import { json, slugify, readStringField, parseJsonBody, isValidHttpUrl, isFiniteNumber, isAdmin } from "../helpers";

// ── Validation helper (pure function, unchanged) ─────────────────

function buildEventRecord(body: Record<string, unknown>, ownerId: string): {
  record?: Omit<EventRecord, "id" | "createdAt" | "updatedAt">;
  error?: string;
} {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length < 2) return { error: "Titill verður að vera a.m.k. 2 stafir" };

  const slug = typeof body.slug === "string" ? slugify(body.slug) : slugify(title);
  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  if (!startTime) return { error: "startTime vantar" };
  const startDate = new Date(startTime);
  if (isNaN(startDate.getTime())) return { error: "Ógild startTime dagsetning" };

  const description = typeof body.description === "string" ? body.description : undefined;
  const endTime = typeof body.endTime === "string" ? body.endTime : undefined;
  if (endTime) {
    const endDate = new Date(endTime);
    if (isNaN(endDate.getTime())) return { error: "Ógild endTime dagsetning" };
    if (endDate <= startDate) return { error: "endTime verður að vera eftir startTime" };
  }
  const timezone = typeof body.timezone === "string" ? body.timezone : "Atlantic/Reykjavik";
  const published = body.published === true;
  const metadata = typeof body.metadata === "object" && body.metadata !== null
    ? body.metadata as Record<string, string>
    : undefined;

  return {
    record: { ownerId, slug, title, description, startTime, endTime, timezone, published, metadata },
  };
}

function rowToEvent(r: Record<string, unknown>): EventRecord {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    slug: r.slug as string,
    title: r.title as string,
    description: (r.description as string) ?? undefined,
    startTime: r.start_time as string,
    endTime: (r.end_time as string) ?? undefined,
    timezone: (r.timezone as string) ?? "Atlantic/Reykjavik",
    published: (r.published as number) === 1,
    metadata: r.metadata ? JSON.parse(r.metadata as string) as Record<string, string> : undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

// ── Route handler ────────────────────────────────────────────────

export async function handleEventsRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  // POST /api/events/create
  if (url.pathname === "/api/events/create" && request.method === "POST") {
    const body = await parseJsonBody(request);
    const ownerId = typeof body.ownerId === "string" ? body.ownerId : "anonymous";
    const { record, error } = buildEventRecord(body, ownerId);
    if (error || !record) return json({ error: error || "Ógild gögn" }, 400);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO events (id, owner_id, slug, title, description, start_time, end_time, timezone, published, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, record.ownerId, record.slug, record.title,
      record.description ?? null, record.startTime, record.endTime ?? null,
      record.timezone, record.published ? 1 : 0,
      record.metadata ? JSON.stringify(record.metadata) : null,
      now, now,
    ).run();

    const event: EventRecord = { id, ...record, createdAt: now, updatedAt: now };
    return json({ success: true, event }, 201);
  }

  // POST /api/events/clone
  if (url.pathname === "/api/events/clone" && request.method === "POST") {
    const body = await parseJsonBody(request);
    const sourceId = typeof body.sourceId === "string" ? body.sourceId : "";
    if (!sourceId) return json({ error: "sourceId vantar" }, 400);

    const source = await env.DB.prepare(
      "SELECT * FROM events WHERE id = ?"
    ).bind(sourceId).first();
    if (!source) return json({ error: "Upprunalegt event fannst ekki" }, 404);
    const sourceEvent = rowToEvent(source as Record<string, unknown>);

    const newId = crypto.randomUUID();
    const newSlug = sourceEvent.slug + "-copy-" + Date.now().toString(36);
    const now = new Date().toISOString();
    const ownerId = typeof body.ownerId === "string" ? body.ownerId : sourceEvent.ownerId;

    await env.DB.prepare(
      `INSERT INTO events (id, owner_id, slug, title, description, start_time, end_time, timezone, published, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      newId, ownerId, newSlug, sourceEvent.title + " (afrit)",
      sourceEvent.description ?? null, sourceEvent.startTime,
      sourceEvent.endTime ?? null, sourceEvent.timezone ?? "Atlantic/Reykjavik",
      0, sourceEvent.metadata ? JSON.stringify(sourceEvent.metadata) : null,
      now, now,
    ).run();

    const cloned: EventRecord = {
      id: newId, ownerId, slug: newSlug, title: sourceEvent.title + " (afrit)",
      description: sourceEvent.description, startTime: sourceEvent.startTime,
      endTime: sourceEvent.endTime, timezone: sourceEvent.timezone,
      published: false, metadata: sourceEvent.metadata,
      createdAt: now, updatedAt: now,
    };
    return json({ success: true, event: cloned }, 201);
  }

  // GET /api/events/dashboard/me
  if (url.pathname === "/api/events/dashboard/me" && request.method === "GET") {
    const ownerId = url.searchParams.get("ownerId");
    if (!ownerId) return json({ error: "ownerId vantar" }, 400);

    const results = await env.DB.prepare(
      "SELECT * FROM events WHERE owner_id = ? ORDER BY created_at DESC"
    ).bind(ownerId).all();

    const events = results.results.map((r) => rowToEvent(r as Record<string, unknown>));
    return json({ total: events.length, events });
  }

  // GET /api/events/public
  if (url.pathname === "/api/events/public" && request.method === "GET") {
    const slug = url.searchParams.get("slug");
    const id = url.searchParams.get("id");

    if (id) {
      const row = await env.DB.prepare(
        "SELECT * FROM events WHERE id = ? AND published = 1"
      ).bind(id).first();
      if (!row) return json({ error: "Event fannst ekki" }, 404);
      return json(rowToEvent(row as Record<string, unknown>));
    }

    if (slug) {
      const row = await env.DB.prepare(
        "SELECT * FROM events WHERE slug = ? AND published = 1"
      ).bind(slug).first();
      if (!row) return json({ error: "Event fannst ekki" }, 404);
      return json(rowToEvent(row as Record<string, unknown>));
    }

    // List all published events
    const results = await env.DB.prepare(
      "SELECT * FROM events WHERE published = 1 ORDER BY start_time ASC"
    ).all();
    const events = results.results.map((r) => rowToEvent(r as Record<string, unknown>));
    return json({ total: events.length, events });
  }

  // PUT /api/events/update
  if (url.pathname === "/api/events/update" && request.method === "PUT") {
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);

    const existing = await env.DB.prepare(
      "SELECT * FROM events WHERE id = ?"
    ).bind(id).first();
    if (!existing) return json({ error: "Event fannst ekki" }, 404);

    const body = await parseJsonBody(request);
    const now = new Date().toISOString();

    const title = typeof body.title === "string" ? body.title : existing.title as string;
    const description = typeof body.description === "string" ? body.description : existing.description as string | null;
    const startTime = typeof body.startTime === "string" ? body.startTime : existing.start_time as string;
    const endTime = typeof body.endTime === "string" ? body.endTime : existing.end_time as string | null;
    const timezone = typeof body.timezone === "string" ? body.timezone : existing.timezone as string;
    const published = typeof body.published === "boolean" ? (body.published ? 1 : 0) : existing.published as number;
    const metadata = typeof body.metadata === "object" && body.metadata !== null
      ? JSON.stringify(body.metadata) : existing.metadata as string | null;

    await env.DB.prepare(
      `UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?,
       timezone = ?, published = ?, metadata = ?, updated_at = ? WHERE id = ?`
    ).bind(title, description, startTime, endTime, timezone, published, metadata, now, id).run();

    const updated = await env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(id).first();
    return json({ success: true, event: rowToEvent(updated as Record<string, unknown>) });
  }

  // DELETE /api/events/delete
  if (url.pathname === "/api/events/delete" && request.method === "DELETE") {
    if (!isAdmin(request, env)) return json({ error: "Aðgangur ekki leyfður" }, 401);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);

    const result = await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) return json({ error: "Event fannst ekki" }, 404);
    return json({ success: true, deleted: id });
  }

  return null;
}
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "events.ts"`
Expected: No errors.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/events.ts
git commit -m "feat: migrate events.ts from 3 in-memory Maps to D1"
```

---

## Task 13: Migrate admin.ts to D1

**Files:**
- Modify: `modules/mobile-app-shell/routes/admin.ts`

**Step 1: Rewrite admin.ts**

The admin route aggregates data from multiple sources. It imports load functions from other route modules.

```typescript
/**
 * Admin overview route handler — aggregates from D1 tables.
 */

import type { Env } from "../types";
import { json, slugify, isAdmin } from "../helpers";
import { loadAllRsvps } from "./rsvp";
import { loadQuizSummary, loadRecentAnswers } from "./quiz";
import { loadPlannerApplications } from "./planner";

export async function handleAdminRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/admin/overview" && request.method === "GET") {
    if (!isAdmin(request, env)) {
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    }
    const slug = slugify(url.searchParams.get("slug") || "omars50");

    const [rsvps, quizSummary, recentAnswers, applications] = await Promise.all([
      loadAllRsvps(env, slug),
      loadQuizSummary(env, slug),
      loadRecentAnswers(env, slug, 20),
      loadPlannerApplications(env, slug),
    ]);

    return json({
      slug,
      rsvp: {
        total: rsvps.length,
        attending: rsvps.filter((r) => r.attending).length,
        totalGuests: rsvps
          .filter((r) => r.attending)
          .reduce((sum, r) => sum + (r.partySize ?? 1), 0),
        records: rsvps,
      },
      quiz: {
        summary: quizSummary,
        recentAnswers,
      },
      planner: {
        total: applications.length,
        applications,
      },
    });
  }

  return null;
}
```

**Step 2: Verify typecheck**

Run: `npm run typecheck 2>&1 | grep "admin.ts"`
Expected: No errors.

**Step 3: Commit**

```bash
git add modules/mobile-app-shell/routes/admin.ts
git commit -m "feat: migrate admin.ts to use D1-backed loader functions"
```

---

## Task 14: Remove state.ts and clean up imports

**Files:**
- Delete: `modules/mobile-app-shell/state.ts`
- Modify: `modules/mobile-app-shell/helpers.ts` (remove state.ts imports if any)

**Step 1: Delete state.ts**

```bash
rm modules/mobile-app-shell/state.ts
```

**Step 2: Search for remaining state.ts imports**

```bash
grep -r "from.*state" modules/mobile-app-shell/ --include="*.ts"
```

Expected: No results. All routes should now import from `../types` and `../helpers` only.

If any imports remain, fix them.

**Step 3: Clean up helpers.ts**

Remove `parseQuizSummary`, `parseRecentAnswers`, and `parseEventRecord` helper functions from `helpers.ts` if they are no longer imported anywhere (they were used for KV parsing).

Search first:
```bash
grep -r "parseQuizSummary\|parseRecentAnswers\|parseEventRecord" modules/mobile-app-shell/ --include="*.ts"
```

If no imports found, remove the functions.

**Step 4: Verify full typecheck**

Run: `npm run typecheck`
Expected: No errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "cleanup: remove state.ts and unused KV parsing helpers"
```

---

## Task 15: Update tests for D1 mocks

**Files:**
- Modify: `tests/unit/worker-validation.test.ts`

**Step 1: Add D1 mock to test environment**

The existing tests create a mock `env` object. Update it to include `DB` and `MEDIA_BUCKET` mocks:

```typescript
function createMockD1() {
  const data = new Map<string, any>();
  return {
    prepare: (sql: string) => ({
      bind: (...args: any[]) => ({
        run: async () => ({ meta: { changes: 1 } }),
        first: async () => null,
        all: async () => ({ results: [] }),
      }),
      run: async () => ({ meta: { changes: 0 } }),
      first: async () => null,
      all: async () => ({ results: [] }),
    }),
    batch: async (stmts: any[]) => stmts.map(() => ({ results: [] })),
  };
}

function createMockR2() {
  return {
    get: async () => null,
    put: async () => {},
    delete: async () => {},
  };
}

// In the test env:
const env = {
  DB: createMockD1(),
  MEDIA_BUCKET: createMockR2(),
  QUIZ_DATA: createMockKV(),
  ADMIN_PASSWORD: "test-password",
};
```

**Step 2: Update individual test assertions**

Review each test to ensure request/response expectations match the new D1-based routes. The API signatures (request format, response shape) should be largely the same.

**Step 3: Run tests**

Run: `npm run test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add tests/
git commit -m "test: update unit tests with D1 and R2 mocks"
```

---

## Task 16: Full quality gate and deploy

**Step 1: Run complete quality gate**

```bash
npm run typecheck && npm run test && npm run build
```

Expected: All pass.

**Step 2: Run lint (if available)**

```bash
npm run lint
```

Expected: No new errors.

**Step 3: Deploy migration to remote D1 (if not done in Task 2)**

```bash
npx wrangler d1 execute its_my_birthday_db --remote --file=migrations/0001_initial_schema.sql
```

**Step 4: Deploy worker**

```bash
npm run deploy
```

Expected: Worker deployed successfully.

**Step 5: Verify production endpoints**

```bash
curl -s https://mybirthday.myx.is/api/rsvp/stats | head -c 200
curl -s https://mybirthday.myx.is/api/quiz/questions?slug=omars50 | head -c 200
curl -s https://mybirthday.myx.is/api/karaoke/songs?slug=omars50 | head -c 200
```

Expected: All return valid JSON without errors.

**Step 6: Commit any remaining changes**

```bash
git add -A
git commit -m "deploy: D1 migration complete — all routes use persistent storage"
```

---

## Verification

```bash
# After all tasks complete:
npm run typecheck   # No errors
npm run test        # All tests pass
npm run build       # Wrangler bundles correctly

# Production checks:
curl -s https://mybirthday.myx.is/api/rsvp/stats
curl -s https://mybirthday.myx.is/api/quiz/questions
curl -s https://mybirthday.myx.is/api/karaoke/songs
curl -s https://mybirthday.myx.is/api/events/public
```
