/**
 * RSVP route handlers and persistence (D1).
 */

import type { Env, RsvpRecord } from "../types";
import { HttpError } from "../types";
import {
  json,
  parseJsonBody,
  readStringField,
  normalizeId,
} from "../helpers";

const DEFAULT_SLUG = "omars50";

// ── Row mapping ─────────────────────────────────────────────────

function rowToRsvp(row: Record<string, unknown>): RsvpRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    contact: row.contact as string,
    method: row.method as "sms" | "google",
    attending: Boolean(row.attending),
    partySize: (row.party_size as number) ?? 1,
    plusOne: (row.plus_one as string) || undefined,
    dietary: (row.dietary as string) || undefined,
    note: (row.note as string) || undefined,
    updatedAt: row.updated_at as string,
  };
}

// ── Persistence (D1) ────────────────────────────────────────────

export async function saveRsvp(env: Env, record: RsvpRecord): Promise<void> {
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
       updated_at = excluded.updated_at`,
  )
    .bind(
      record.id,
      DEFAULT_SLUG,
      record.name,
      record.contact,
      record.method,
      record.attending ? 1 : 0,
      record.partySize ?? 1,
      record.plusOne ?? null,
      record.dietary ?? null,
      record.note ?? null,
      record.updatedAt,
    )
    .run();
}

export async function loadAllRsvps(env: Env): Promise<RsvpRecord[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM rsvp ORDER BY updated_at DESC",
  ).all();
  return (result.results ?? []).map(rowToRsvp);
}

// ── Route handler ────────────────────────────────────────────────

export async function handleRsvpRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/api/rsvp" && request.method === "POST") {
    const body = await parseJsonBody(request);
    const method =
      body.method === "sms" || body.method === "google"
        ? body.method
        : null;
    const contact = readStringField(body.contact, "contact", 180, true);
    const name = readStringField(body.name, "name", 120) || "Guest";
    if (!method || typeof body.attending !== "boolean") {
      throw new HttpError(
        400,
        "Innskráningaraðferð, tengilið og mætingarstaða vantar",
      );
    }
    let partySize = 1;
    if (body.partySize !== undefined) {
      const rawPartySize = Number(body.partySize);
      if (
        !Number.isInteger(rawPartySize) ||
        rawPartySize < 1 ||
        rawPartySize > 20
      ) {
        throw new HttpError(
          400,
          "partySize þarf að vera heiltala á bilinu 1-20",
        );
      }
      partySize = rawPartySize;
    }

    const id = normalizeId(method, contact);
    const record: RsvpRecord = {
      id,
      name,
      contact,
      method,
      attending: body.attending,
      partySize,
      plusOne: readStringField(body.plusOne, "plusOne", 120),
      dietary: readStringField(body.dietary, "dietary", 300),
      note: readStringField(body.note, "note", 1000),
      updatedAt: new Date().toISOString(),
    };

    await saveRsvp(env, record);
    return json({ success: true, record });
  }

  if (url.pathname === "/api/rsvp/stats" && request.method === "GET") {
    const records = await loadAllRsvps(env);
    const attendingYes = records.filter((r) => r.attending).length;
    const attendingNo = records.length - attendingYes;
    return json({ total: records.length, attendingYes, attendingNo });
  }

  return null;
}
