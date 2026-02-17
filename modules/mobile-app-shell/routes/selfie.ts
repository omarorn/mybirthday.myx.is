/**
 * MySelfie route handlers — D1 metadata + R2 image storage.
 */

import type { Env, SelfieItem } from "../types";
import { json, slugify, isAdmin } from "../helpers";

// ── Row mapping ─────────────────────────────────────────────────

function rowToSelfie(row: Record<string, unknown>): SelfieItem {
  return {
    id: row.id as string,
    slug: row.slug as string,
    imageKey: row.image_key as string,
    caption: (row.caption as string) || undefined,
    submittedBy: row.submitted_by as string,
    takenAt: row.taken_at as string,
  };
}

// ── Persistence (D1 + R2) ───────────────────────────────────────

async function loadSelfies(env: Env, slug: string): Promise<SelfieItem[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM selfies WHERE slug = ? ORDER BY taken_at DESC LIMIT 200",
  )
    .bind(slug)
    .all();
  return (result.results ?? []).map(rowToSelfie);
}

// ── Route handler ────────────────────────────────────────────────

export async function handleSelfieRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/selfie/list" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const items = await loadSelfies(env, slug);
    return json({
      slug,
      total: items.length,
      items: items.map((s) => ({ ...s, imageKey: undefined, hasImage: true })),
    });
  }

  if (url.pathname === "/api/selfie/image" && request.method === "GET") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);

    const imageKey = `selfies/${slug}/${id}`;
    const obj = await env.MEDIA_BUCKET.get(imageKey);
    if (!obj) return json({ error: "Mynd fannst ekki" }, 404);

    const bytes = await obj.arrayBuffer();
    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(bytes)),
    );
    return json({ imageBase64: base64 });
  }

  if (url.pathname === "/api/selfie/capture" && request.method === "POST") {
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const body = (await request.json()) as {
      imageData?: string;
      caption?: string;
      submittedBy?: string;
    };
    if (!body.imageData || !body.submittedBy) {
      return json({ error: "imageData og submittedBy eru nauðsynleg" }, 400);
    }
    if (body.imageData.length > 700_000) {
      return json({ error: "Mynd of stór (hámark ~500KB)" }, 400);
    }

    const id = crypto.randomUUID();
    const imageKey = `selfies/${slug}/${id}`;

    // Strip data-URI prefix if present
    const raw = body.imageData.includes(",")
      ? body.imageData.split(",")[1]
      : body.imageData;
    const binaryString = atob(raw);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    await env.MEDIA_BUCKET.put(imageKey, bytes, {
      httpMetadata: { contentType: "image/jpeg" },
    });

    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO selfies (id, slug, image_key, caption, submitted_by, taken_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, slug, imageKey, body.caption || "", body.submittedBy, now)
      .run();

    const item: SelfieItem = {
      id,
      slug,
      imageKey,
      caption: body.caption || "",
      submittedBy: body.submittedBy,
      takenAt: now,
    };
    return json({ success: true, item: { ...item, imageKey: undefined } }, 201);
  }

  if (url.pathname === "/api/selfie/item" && request.method === "DELETE") {
    if (!isAdmin(request, env))
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);

    const existing = await env.DB.prepare(
      "SELECT image_key FROM selfies WHERE id = ? AND slug = ?",
    )
      .bind(id, slug)
      .first<{ image_key: string }>();
    if (!existing) return json({ error: "Selfie fannst ekki" }, 404);

    await env.MEDIA_BUCKET.delete(existing.image_key);
    await env.DB.prepare("DELETE FROM selfies WHERE id = ?").bind(id).run();

    return json({ success: true, deleted: id });
  }

  return null;
}
