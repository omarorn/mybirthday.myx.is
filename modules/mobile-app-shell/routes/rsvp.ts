/**
 * RSVP route handlers and persistence.
 */

import type { Env, RsvpRecord } from "../types";
import { HttpError } from "../types";
import {
  json,
  parseJsonBody,
  readStringField,
  normalizeId,
} from "../helpers";
import { memoryStore } from "../state";

// ── Persistence ──────────────────────────────────────────────────

export async function saveRsvp(env: Env, record: RsvpRecord): Promise<void> {
  memoryStore.set(record.id, record);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`rsvp:${record.id}`, JSON.stringify(record));
  }
}

export async function loadAllRsvps(env: Env): Promise<RsvpRecord[]> {
  if (!env.QUIZ_DATA) return Array.from(memoryStore.values());

  const listed = await env.QUIZ_DATA.list({ prefix: "rsvp:" });
  const records = await Promise.all(
    listed.keys.map(async (key) => {
      const raw = await env.QUIZ_DATA!.get(key.name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as RsvpRecord;
      } catch {
        return null;
      }
    }),
  );
  return records.filter(Boolean) as RsvpRecord[];
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
