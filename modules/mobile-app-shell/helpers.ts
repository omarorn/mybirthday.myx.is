/**
 * Shared utility functions for the birthday portal worker.
 */

import type {
  Env,
  JsonObject,
  QuizQuestion,
} from "./types";
import { HttpError } from "./types";

export const MAX_JSON_BODY_BYTES = 64 * 1024;

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assertJsonRequest(request: Request): void {
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "Content-Type verður að vera application/json");
  }
}

export async function parseJsonBody(
  request: Request,
  options?: { allowEmpty?: boolean },
): Promise<JsonObject> {
  assertJsonRequest(request);
  const raw = await request.text();
  const byteLength = new TextEncoder().encode(raw).length;
  if (byteLength > MAX_JSON_BODY_BYTES) {
    throw new HttpError(413, "Beiðni er of stór");
  }
  if (!raw.trim()) {
    if (options?.allowEmpty) return {};
    throw new HttpError(400, "Beiðni vantar JSON-gögn");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Ógilt JSON-innihald");
  }
  if (!isJsonObject(parsed)) {
    throw new HttpError(400, "JSON-gögn verða að vera hlutur");
  }
  return parsed;
}

export function readStringField(
  value: unknown,
  field: string,
  maxLength: number,
  required = false,
): string {
  if (typeof value !== "string") {
    if (required) throw new HttpError(400, `${field} vantar`);
    return "";
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw new HttpError(400, `${field} vantar`);
  if (trimmed.length > maxLength)
    throw new HttpError(400, `${field} er of langt`);
  return trimmed;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function normalizeId(method: string, contact: string): string {
  return `${method}:${contact.trim().toLowerCase()}`;
}

export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[#@]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function getSlugFromPath(pathname: string): string | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return null;
  if (first === "api") return null;
  if (!/^[a-z0-9-]{3,40}$/.test(first)) return null;
  return first;
}

export function sanitizeQuestions(questions: QuizQuestion[]) {
  return questions.map((q) => ({
    id: q.id,
    yr: q.yr,
    cat: q.cat,
    q: q.q,
    hint: q.hint,
    opts: q.opts,
    exp: q.exp,
    fun: q.fun,
  }));
}

export function isAdmin(request: Request, env: Env): boolean {
  const expected = env.ADMIN_PASSWORD ?? "changeme";
  const provided = request.headers.get("x-admin-password") ?? "";
  return safeCompare(expected, provided);
}
