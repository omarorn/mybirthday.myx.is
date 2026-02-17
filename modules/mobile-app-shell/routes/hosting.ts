/**
 * Hosting/tenant route handlers and persistence (D1).
 */

import type { Env, TenantConfig } from "../types";
import { HttpError } from "../types";
import {
  json,
  parseJsonBody,
  readStringField,
  slugify,
  getSlugFromPath,
} from "../helpers";

// ── Row mapping ─────────────────────────────────────────────────

function rowToTenant(row: Record<string, unknown>): TenantConfig {
  return {
    slug: row.slug as string,
    title: row.title as string,
    hashtag: row.hashtag as string,
    instagramHandle: (row.instagram_handle as string) || undefined,
    owner: (row.owner as string) || undefined,
    createdAt: row.created_at as string,
  };
}

// ── Persistence (D1) ────────────────────────────────────────────

export async function loadTenant(
  env: Env,
  slug: string,
): Promise<TenantConfig | null> {
  const row = await env.DB.prepare(
    "SELECT * FROM tenants WHERE slug = ?",
  )
    .bind(slug)
    .first();
  if (!row) return null;
  return rowToTenant(row as Record<string, unknown>);
}

export async function saveTenant(env: Env, tenant: TenantConfig): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO tenants (slug, title, hashtag, instagram_handle, owner, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title,
       hashtag = excluded.hashtag,
       instagram_handle = excluded.instagram_handle,
       owner = excluded.owner`,
  )
    .bind(
      tenant.slug,
      tenant.title,
      tenant.hashtag,
      tenant.instagramHandle ?? null,
      tenant.owner ?? null,
      tenant.createdAt,
    )
    .run();
}

// ── Route handler ────────────────────────────────────────────────

export async function handleHostingRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/hosting/signup" && request.method === "POST") {
    const body = await parseJsonBody(request);
    const title = readStringField(body.title, "title", 120);
    const hashtag = readStringField(body.hashtag, "hashtag", 80);
    const instagramHandle = readStringField(
      body.instagramHandle,
      "instagramHandle",
      80,
    );
    const owner = readStringField(body.owner, "owner", 120);
    const source = hashtag || instagramHandle || title;
    const slug = slugify(source);
    if (!slug || slug.length < 3) {
      throw new HttpError(
        400,
        "Could not generate slug. Provide hashtag/instagramHandle/title.",
      );
    }
    const existing = await loadTenant(env, slug);
    if (existing) {
      return json({ error: "Slóð er þegar í notkun", slug }, 409);
    }
    const hashtagRaw = (hashtag || slug).replace(/^#/, "");
    const tenant: TenantConfig = {
      slug,
      title: title || `It's My Birthday: ${slug}`,
      hashtag: hashtagRaw,
      instagramHandle: instagramHandle
        ? instagramHandle.replace(/^@/, "")
        : undefined,
      owner: owner || undefined,
      createdAt: new Date().toISOString(),
    };
    await saveTenant(env, tenant);
    return json(
      {
        success: true,
        tenant,
        url: `https://mybirthday.myx.is/${slug}`,
        hashtagUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(hashtagRaw)}/`,
      },
      201,
    );
  }

  if (url.pathname === "/api/hosting/tenant" && request.method === "GET") {
    const rawSlug =
      url.searchParams.get("slug") || getSlugFromPath(url.pathname) || "";
    const slug = slugify(rawSlug);
    if (!slug) return json({ error: "Slóð vantar" }, 400);
    const tenant = await loadTenant(env, slug);
    if (!tenant) return json({ error: "Tenant not found" }, 404);
    return json({ tenant });
  }

  return null;
}
