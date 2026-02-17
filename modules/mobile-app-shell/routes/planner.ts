/**
 * Planner application route handlers and persistence (D1).
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

// ── Row mapping ─────────────────────────────────────────────────

function rowToPlanner(row: Record<string, unknown>): PlannerApplication {
  return {
    id: row.id as string,
    slug: row.slug as string,
    type: row.type as "host_add" | "surprise_help",
    applicantName: row.applicant_name as string,
    contact: row.contact as string,
    forGuest: (row.for_guest as string) || undefined,
    note: row.note as string,
    createdAt: row.created_at as string,
  };
}

// ── Persistence (D1) ────────────────────────────────────────────

export async function loadPlannerApplications(
  env: Env,
  slug: string,
): Promise<PlannerApplication[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM planner_applications WHERE slug = ? ORDER BY created_at DESC LIMIT 300",
  )
    .bind(slug)
    .all();
  return (result.results ?? []).map(rowToPlanner);
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

    await env.DB.prepare(
      `INSERT INTO planner_applications (id, slug, type, applicant_name, contact, for_guest, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        application.id,
        application.slug,
        application.type,
        application.applicantName,
        application.contact,
        application.forGuest ?? null,
        application.note,
        application.createdAt,
      )
      .run();

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
