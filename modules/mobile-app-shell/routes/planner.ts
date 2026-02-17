/**
 * Planner application route handlers and persistence.
 */

import type { Env, PlannerApplication } from "../types";
import { HttpError } from "../types";
import {
  json,
  parseJsonBody,
  readStringField,
  slugify,
  isAdmin,
} from "../helpers";
import { memoryPlannerApplications } from "../state";

// ── Persistence ──────────────────────────────────────────────────

export async function loadPlannerApplications(
  env: Env,
  slug: string,
): Promise<PlannerApplication[]> {
  if (!env.QUIZ_DATA) return memoryPlannerApplications.get(slug) ?? [];
  const raw = await env.QUIZ_DATA.get(`planner:${slug}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PlannerApplication[];
  } catch {
    return [];
  }
}

async function savePlannerApplications(
  env: Env,
  slug: string,
  items: PlannerApplication[],
): Promise<void> {
  memoryPlannerApplications.set(slug, items);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`planner:${slug}`, JSON.stringify(items));
  }
}

// ── Route handler ────────────────────────────────────────────────

export async function handlePlannerRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/planner/apply" && request.method === "POST") {
    const body = await parseJsonBody(request);
    const slug = slugify(
      readStringField(body.slug, "slug", 80) || "omars50",
    );
    const type =
      body.type === "host_add" || body.type === "surprise_help"
        ? body.type
        : null;
    const applicantName = readStringField(
      body.applicantName,
      "applicantName",
      120,
      true,
    );
    const contact = readStringField(body.contact, "contact", 180, true);
    const note = readStringField(body.note, "note", 1000, true);
    const forGuest = readStringField(body.forGuest, "forGuest", 120);

    if (!slug || !type) {
      throw new HttpError(400, "Vantar lögboðin umsóknargögn");
    }

    const application: PlannerApplication = {
      id: crypto.randomUUID(),
      slug,
      type,
      applicantName,
      contact,
      forGuest,
      note,
      createdAt: new Date().toISOString(),
    };
    const existing = await loadPlannerApplications(env, slug);
    existing.unshift(application);
    await savePlannerApplications(env, slug, existing.slice(0, 300));
    return json({ success: true, application }, 201);
  }

  if (
    url.pathname === "/api/planner/applications" &&
    request.method === "GET"
  ) {
    if (!isAdmin(request, env))
      return json({ error: "Aðgangur ekki leyfður" }, 401);
    const slug = slugify(url.searchParams.get("slug") || "omars50");
    const items = await loadPlannerApplications(env, slug);
    return json({ slug, total: items.length, items });
  }

  return null;
}
