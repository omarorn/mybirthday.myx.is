/**
 * Photo wall route handlers and persistence.
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
import { memoryPhotoWall } from "../state";
import { loadTenant } from "./hosting";

// ── Persistence ──────────────────────────────────────────────────

async function loadPhotoWall(env: Env, slug: string): Promise<PhotoWallItem[]> {
  if (!env.QUIZ_DATA) return memoryPhotoWall.get(slug) ?? [];
  const raw = await env.QUIZ_DATA.get(`photowall:${slug}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PhotoWallItem[];
  } catch {
    return [];
  }
}

async function savePhotoWall(
  env: Env,
  slug: string,
  items: PhotoWallItem[],
): Promise<void> {
  memoryPhotoWall.set(slug, items);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`photowall:${slug}`, JSON.stringify(items));
  }
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
    const items = await loadPhotoWall(env, slug);
    items.unshift(item);
    await savePhotoWall(env, slug, items.slice(0, 200));
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
    const items = await loadPhotoWall(env, slug);
    const filtered = items.filter((x) => x.id !== id);
    await savePhotoWall(env, slug, filtered);
    return json({ success: true, id, slug });
  }

  return null;
}
