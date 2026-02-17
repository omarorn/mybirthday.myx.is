/**
 * Photo wall route handlers and persistence (D1).
 */

import type { Env, PhotoWallItem } from "../types";
import { HttpError } from "../types";
import {
  json,
  parseJsonBody,
  readStringField,
  slugify,
  getSlugFromPath,
  isValidHttpUrl,
  isAdmin,
} from "../helpers";
import { loadTenant } from "./hosting";

// ── Row mapping ─────────────────────────────────────────────────

function rowToPhoto(row: Record<string, unknown>): PhotoWallItem {
  return {
    id: row.id as string,
    slug: row.slug as string,
    imageUrl: row.image_url as string,
    caption: (row.caption as string) || undefined,
    sourceUrl: (row.source_url as string) || undefined,
    addedAt: row.added_at as string,
  };
}

// ── Persistence (D1) ────────────────────────────────────────────

async function loadPhotoWall(env: Env, slug: string): Promise<PhotoWallItem[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM photos WHERE slug = ? ORDER BY added_at DESC LIMIT 200",
  )
    .bind(slug)
    .all();
  return (result.results ?? []).map(rowToPhoto);
}

// ── Route handler ────────────────────────────────────────────────

export async function handlePhotowallRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/photowall" && request.method === "GET") {
    const slugSource =
      url.searchParams.get("slug") ||
      getSlugFromPath(
        new URL(request.headers.get("referer") || "https://x").pathname,
      ) ||
      "omars50";
    const slug = slugify(slugSource) || "omars50";
    const tenant = (await loadTenant(env, slug)) ?? {
      slug,
      title: `It's My Birthday: ${slug}`,
      hashtag: slug,
      createdAt: new Date().toISOString(),
    };
    const items = await loadPhotoWall(env, slug);
    return json({
      slug,
      hashtag: tenant.hashtag,
      hashtagUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(tenant.hashtag)}/`,
      items,
    });
  }

  if (url.pathname === "/api/photowall/item" && request.method === "POST") {
    if (!isAdmin(request, env))
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    const body = await parseJsonBody(request);
    const slug = slugify(
      readStringField(body.slug, "slug", 80) || "omars50",
    );
    if (!slug) return json({ error: "Slóð vantar" }, 400);
    const imageUrl = readStringField(body.imageUrl, "imageUrl", 2000, true);
    if (!isValidHttpUrl(imageUrl))
      throw new HttpError(400, "Myndaslóð er ógild");
    const caption = readStringField(body.caption, "caption", 300);
    const sourceUrl = readStringField(body.sourceUrl, "sourceUrl", 2000);
    if (sourceUrl && !isValidHttpUrl(sourceUrl))
      throw new HttpError(400, "sourceUrl er ógild");

    const item: PhotoWallItem = {
      id: crypto.randomUUID(),
      slug,
      imageUrl,
      caption,
      sourceUrl,
      addedAt: new Date().toISOString(),
    };

    await env.DB.prepare(
      `INSERT INTO photos (id, slug, image_url, caption, source_url, added_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        item.id,
        item.slug,
        item.imageUrl,
        item.caption ?? null,
        item.sourceUrl ?? null,
        item.addedAt,
      )
      .run();

    return json({ success: true, item }, 201);
  }

  if (
    url.pathname === "/api/photowall/item" &&
    request.method === "DELETE"
  ) {
    if (!isAdmin(request, env))
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id") || "";
    if (!id) return json({ error: "Auðkenni vantar" }, 400);

    await env.DB.prepare(
      "DELETE FROM photos WHERE id = ? AND slug = ?",
    )
      .bind(id, slug)
      .run();

    return json({ success: true, id, slug });
  }

  return null;
}
