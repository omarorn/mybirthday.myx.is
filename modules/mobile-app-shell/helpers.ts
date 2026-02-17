/**
 * Shared utility functions for the birthday portal worker.
 */

import type {
  Env,
  JsonObject,
  QuizQuestion,
  QuizSummary,
  QuizRecentAnswer,
  EventRecord,
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

export function parseQuizSummary(value: unknown): QuizSummary | null {
  if (!isJsonObject(value)) return null;
  if (
    !isFiniteNumber(value.totalAnswers) ||
    !isFiniteNumber(value.totalCorrect)
  ) {
    return null;
  }
  if (!isJsonObject(value.questionStats)) return null;
  const questionStats: QuizSummary["questionStats"] = {};
  for (const [id, stat] of Object.entries(value.questionStats)) {
    if (!isJsonObject(stat)) continue;
    if (!isFiniteNumber(stat.total) || !isFiniteNumber(stat.correct)) continue;
    if (!Array.isArray(stat.optionCounts)) continue;
    const optionCounts = stat.optionCounts.filter(isFiniteNumber);
    questionStats[id] = {
      total: stat.total,
      correct: stat.correct,
      optionCounts,
    };
  }
  return {
    totalAnswers: value.totalAnswers,
    totalCorrect: value.totalCorrect,
    questionStats,
  };
}

export function parseRecentAnswers(
  value: unknown,
): QuizRecentAnswer[] | null {
  if (!Array.isArray(value)) return null;
  const parsed: QuizRecentAnswer[] = [];
  for (const item of value) {
    if (!isJsonObject(item)) continue;
    if (!isFiniteNumber(item.questionId) || !isFiniteNumber(item.choice))
      continue;
    if (typeof item.ts !== "string" || typeof item.playerId !== "string")
      continue;
    if (
      typeof item.playerName !== "string" ||
      typeof item.correct !== "boolean"
    )
      continue;
    parsed.push({
      ts: item.ts,
      questionId: item.questionId,
      choice: item.choice,
      correct: item.correct,
      playerId: item.playerId,
      playerName: item.playerName,
    });
  }
  return parsed;
}

export function parseEventRecord(value: unknown): EventRecord | null {
  if (!isJsonObject(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.ownerId !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.title !== "string" ||
    typeof value.startTime !== "string" ||
    typeof value.published !== "boolean" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }
  if (value.description !== undefined && typeof value.description !== "string")
    return null;
  if (value.endTime !== undefined && typeof value.endTime !== "string")
    return null;
  if (value.timezone !== undefined && typeof value.timezone !== "string")
    return null;
  if (value.metadata !== undefined && !isJsonObject(value.metadata))
    return null;
  let metadata: Record<string, string> | undefined;
  if (value.metadata !== undefined) {
    metadata = {};
    for (const [key, entryValue] of Object.entries(value.metadata)) {
      if (typeof entryValue === "string") metadata[key] = entryValue;
    }
  }
  return {
    id: value.id,
    ownerId: value.ownerId,
    slug: value.slug,
    title: value.title,
    description: value.description,
    startTime: value.startTime,
    endTime: value.endTime,
    timezone: value.timezone,
    published: value.published,
    metadata,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
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
