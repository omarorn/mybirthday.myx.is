/**
 * MySelfie route handlers and persistence.
 */

import type { Env, SelfieItem } from "../types";
import { json, slugify, isAdmin } from "../helpers";
import { memorySelfies } from "../state";

// ── Persistence ──────────────────────────────────────────────────

async function loadSelfies(env: Env, slug: string): Promise<SelfieItem[]> {
  if (!env.QUIZ_DATA) return memorySelfies.get(slug) ?? [];
  const raw = await env.QUIZ_DATA.get(`selfies:${slug}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SelfieItem[];
  } catch {
    return [];
  }
}

async function saveSelfies(
  env: Env,
  slug: string,
  items: SelfieItem[],
): Promise<void> {
  memorySelfies.set(slug, items);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`selfies:${slug}`, JSON.stringify(items));
  }
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
    return json({ slug, total: items.length, items });
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
    const item: SelfieItem = {
      id: crypto.randomUUID(),
      imageData: body.imageData,
      caption: body.caption || "",
      submittedBy: body.submittedBy,
      takenAt: new Date().toISOString(),
    };
    const items = await loadSelfies(env, slug);
    items.push(item);
    await saveSelfies(env, slug, items);
    return json({ success: true, item }, 201);
  }

  if (url.pathname === "/api/selfie/item" && request.method === "DELETE") {
    if (!isAdmin(request, env))
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id vantar" }, 400);
    const items = await loadSelfies(env, slug);
    const filtered = items.filter((s) => s.id !== id);
    if (filtered.length === items.length) {
      return json({ error: "Selfie fannst ekki" }, 404);
    }
    await saveSelfies(env, slug, filtered);
    return json({ success: true, deleted: id });
  }

  return null;
}
