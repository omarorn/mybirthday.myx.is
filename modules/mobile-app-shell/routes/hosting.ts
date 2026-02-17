/**
 * Hosting/tenant route handlers and persistence.
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
import { memoryTenants } from "../state";

// ── Persistence ──────────────────────────────────────────────────

export async function loadTenant(
  env: Env,
  slug: string,
): Promise<TenantConfig | null> {
  if (!env.QUIZ_DATA) return memoryTenants.get(slug) ?? null;
  const raw = await env.QUIZ_DATA.get(`tenant:${slug}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TenantConfig;
  } catch {
    return null;
  }
}

export async function saveTenant(env: Env, tenant: TenantConfig): Promise<void> {
  memoryTenants.set(tenant.slug, tenant);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`tenant:${tenant.slug}`, JSON.stringify(tenant));
  }
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
