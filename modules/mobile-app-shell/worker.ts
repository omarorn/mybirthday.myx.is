/**
 * It's My Birthday - Cloudflare Worker
 * Landing page + RSVP APIs.
 */

// @ts-expect-error Wrangler bundles HTML imports
import HTML from "./index.html";
import { quizQuestions, type QuizQuestion } from "./quizData";

interface RsvpRecord {
  id: string;
  name: string;
  contact: string;
  method: "sms" | "google";
  attending: boolean;
  partySize?: number;
  plusOne?: string;
  dietary?: string;
  note?: string;
  updatedAt: string;
}

interface QuizSummary {
  totalAnswers: number;
  totalCorrect: number;
  questionStats: Record<
    string,
    {
      total: number;
      correct: number;
      optionCounts: number[];
    }
  >;
}

interface QuizRecentAnswer {
  ts: string;
  questionId: number;
  choice: number;
  correct: boolean;
  playerId: string;
  playerName: string;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  totalAnswers: number;
  totalCorrect: number;
  lastAnswerDate: string | null;
}

interface Env {
  QUIZ_DATA?: KVNamespace;
  ADMIN_PASSWORD?: string;
  AI?: Ai;
}

interface TenantConfig {
  slug: string;
  title: string;
  hashtag: string;
  instagramHandle?: string;
  owner?: string;
  createdAt: string;
}

interface PhotoWallItem {
  id: string;
  slug: string;
  imageUrl: string;
  caption?: string;
  sourceUrl?: string;
  addedAt: string;
}

interface PlannerApplication {
  id: string;
  slug: string;
  type: "host_add" | "surprise_help";
  applicantName: string;
  contact: string;
  forGuest?: string;
  note: string;
  createdAt: string;
}

interface EventRecord {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  published: boolean;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface SelfieItem {
  id: string;
  imageData: string;
  caption?: string;
  submittedBy: string;
  takenAt: string;
}

interface KaraokeSong {
  id: string;
  title: string;
  artist?: string;
  audioKey: string;
  lyrics?: TranscriptSegment[];
  manualLyrics?: string;
  duration?: number;
  addedBy: string;
  createdAt: string;
  status: "uploaded" | "transcribing" | "ready" | "error";
}

interface TranscriptSegment {
  word: string;
  start: number;
  end: number;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const memoryStore = new Map<string, RsvpRecord>();
const memoryCustomQuestions = new Map<number, QuizQuestion>();
let memoryQuizSummary: QuizSummary = {
  totalAnswers: 0,
  totalCorrect: 0,
  questionStats: {},
};
let memoryRecentAnswers: QuizRecentAnswer[] = [];
const memoryTenants = new Map<string, TenantConfig>();
const memoryPhotoWall = new Map<string, PhotoWallItem[]>();
const memoryPlannerApplications = new Map<string, PlannerApplication[]>();
const memoryPlayerStats = new Map<string, PlayerStats>();
const memoryEvents = new Map<string, EventRecord>();
const memoryEventSlugIndex = new Map<string, string>();
const memoryOwnerEventIds = new Map<string, string[]>();
const memorySelfies = new Map<string, SelfieItem[]>();
const memoryKaraokeSongs = new Map<string, KaraokeSong[]>();
const memoryKaraokeAudio = new Map<string, string>();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

type JsonObject = Record<string, unknown>;
const MAX_JSON_BODY_BYTES = 64 * 1024;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertJsonRequest(request: Request): void {
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "Content-Type verður að vera application/json");
  }
}

async function parseJsonBody(
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

function readStringField(
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

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseQuizSummary(value: unknown): QuizSummary | null {
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

function parseRecentAnswers(value: unknown): QuizRecentAnswer[] | null {
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

function parseEventRecord(value: unknown): EventRecord | null {
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

function normalizeId(method: string, contact: string): string {
  return `${method}:${contact.trim().toLowerCase()}`;
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[#@]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function getSlugFromPath(pathname: string): string | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return null;
  if (first === "api") return null;
  if (!/^[a-z0-9-]{3,40}$/.test(first)) return null;
  return first;
}

function sanitizeQuestions(questions: QuizQuestion[]) {
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

async function loadCustomQuizQuestions(env: Env): Promise<QuizQuestion[]> {
  if (!env.QUIZ_DATA) {
    return Array.from(memoryCustomQuestions.values());
  }
  const listed = await env.QUIZ_DATA.list({ prefix: "quiz_custom:" });
  const records = await Promise.all(
    listed.keys.map(async (key) => {
      const raw = await env.QUIZ_DATA!.get(key.name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as QuizQuestion;
      } catch {
        return null;
      }
    }),
  );
  return records.filter(Boolean) as QuizQuestion[];
}

async function saveCustomQuizQuestion(
  env: Env,
  question: QuizQuestion,
): Promise<void> {
  memoryCustomQuestions.set(question.id, question);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(
      `quiz_custom:${question.id}`,
      JSON.stringify(question),
    );
  }
}

async function deleteCustomQuizQuestion(env: Env, id: number): Promise<void> {
  memoryCustomQuestions.delete(id);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.delete(`quiz_custom:${id}`);
  }
}

async function getAllQuestions(env: Env): Promise<QuizQuestion[]> {
  const custom = await loadCustomQuizQuestions(env);
  return [...quizQuestions, ...custom].sort((a, b) => a.id - b.id);
}

// ── Gamification helpers ──────────────────────────────────────────

const BASE_POINTS = 10;
const MAX_STREAK_BONUS = 20;

async function loadPlayerStats(
  env: Env,
  playerId: string,
): Promise<PlayerStats> {
  const cached = memoryPlayerStats.get(playerId);
  if (cached) return cached;
  if (env.QUIZ_DATA) {
    const raw = await env.QUIZ_DATA.get(`quiz_player:${playerId}`);
    if (raw) {
      try {
        const stats = JSON.parse(raw) as PlayerStats;
        memoryPlayerStats.set(playerId, stats);
        return stats;
      } catch {
        /* fall through */
      }
    }
  }
  return {
    playerId,
    playerName: "Guest",
    totalPoints: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalAnswers: 0,
    totalCorrect: 0,
    lastAnswerDate: null,
  };
}

async function savePlayerStats(env: Env, stats: PlayerStats): Promise<void> {
  memoryPlayerStats.set(stats.playerId, stats);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(
      `quiz_player:${stats.playerId}`,
      JSON.stringify(stats),
    );
  }
}

function updatePlayerStreak(stats: PlayerStats): { streakReset: boolean } {
  const today = new Date().toISOString().split("T")[0];
  const lastDate = stats.lastAnswerDate;

  if (!lastDate) {
    stats.currentStreak = 1;
    stats.bestStreak = 1;
    return { streakReset: false };
  }

  const lastDay = new Date(lastDate);
  const todayDay = new Date(today);
  const diffDays = Math.floor(
    (todayDay.getTime() - lastDay.getTime()) / 86400000,
  );

  if (diffDays === 0) {
    return { streakReset: false };
  } else if (diffDays === 1) {
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.bestStreak)
      stats.bestStreak = stats.currentStreak;
    return { streakReset: false };
  } else {
    stats.currentStreak = 1;
    return { streakReset: true };
  }
}

function calculatePointsEarned(
  correct: boolean,
  currentStreak: number,
): { points: number; streakBonus: number } {
  if (!correct) return { points: 0, streakBonus: 0 };
  const streakBonus = Math.min(currentStreak * 2, MAX_STREAK_BONUS);
  return { points: BASE_POINTS, streakBonus };
}

async function loadLeaderboard(env: Env): Promise<PlayerStats[]> {
  const players: PlayerStats[] = [];
  if (env.QUIZ_DATA) {
    const listed = await env.QUIZ_DATA.list({ prefix: "quiz_player:" });
    const records = await Promise.all(
      listed.keys.map(async (key) => {
        const raw = await env.QUIZ_DATA!.get(key.name);
        if (!raw) return null;
        try {
          return JSON.parse(raw) as PlayerStats;
        } catch {
          return null;
        }
      }),
    );
    players.push(...(records.filter(Boolean) as PlayerStats[]));
  } else {
    players.push(...memoryPlayerStats.values());
  }
  return players.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 50);
}

// ── Auth ──────────────────────────────────────────────────────────

function isAdmin(request: Request, env: Env): boolean {
  const expected = env.ADMIN_PASSWORD ?? "changeme";
  const provided = request.headers.get("x-admin-password") ?? "";
  return safeCompare(expected, provided);
}

async function saveRsvp(env: Env, record: RsvpRecord): Promise<void> {
  memoryStore.set(record.id, record);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`rsvp:${record.id}`, JSON.stringify(record));
  }
}

async function loadAllRsvps(env: Env): Promise<RsvpRecord[]> {
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

async function loadQuizSummary(env: Env): Promise<QuizSummary> {
  if (!env.QUIZ_DATA) return memoryQuizSummary;
  const raw = await env.QUIZ_DATA.get("quiz_stats:summary");
  if (!raw) return memoryQuizSummary;
  try {
    const parsed = parseQuizSummary(JSON.parse(raw));
    return parsed ?? memoryQuizSummary;
  } catch {
    return memoryQuizSummary;
  }
}

async function saveQuizSummary(env: Env, summary: QuizSummary): Promise<void> {
  memoryQuizSummary = summary;
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put("quiz_stats:summary", JSON.stringify(summary));
  }
}

async function loadRecentAnswers(env: Env): Promise<QuizRecentAnswer[]> {
  if (!env.QUIZ_DATA) return memoryRecentAnswers;
  const raw = await env.QUIZ_DATA.get("quiz_stats:recent_answers");
  if (!raw) return memoryRecentAnswers;
  try {
    const parsed = parseRecentAnswers(JSON.parse(raw));
    return parsed ?? memoryRecentAnswers;
  } catch {
    return memoryRecentAnswers;
  }
}

async function saveRecentAnswers(
  env: Env,
  answers: QuizRecentAnswer[],
): Promise<void> {
  memoryRecentAnswers = answers;
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(
      "quiz_stats:recent_answers",
      JSON.stringify(answers),
    );
  }
}

async function loadTenant(
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

async function saveTenant(env: Env, tenant: TenantConfig): Promise<void> {
  memoryTenants.set(tenant.slug, tenant);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`tenant:${tenant.slug}`, JSON.stringify(tenant));
  }
}

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

async function loadKaraokeSongs(env: Env, slug: string): Promise<KaraokeSong[]> {
  if (!env.QUIZ_DATA) return memoryKaraokeSongs.get(slug) ?? [];
  const raw = await env.QUIZ_DATA.get(`karaoke:songs:${slug}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as KaraokeSong[];
  } catch {
    return [];
  }
}

async function saveKaraokeSongs(
  env: Env,
  slug: string,
  songs: KaraokeSong[],
): Promise<void> {
  memoryKaraokeSongs.set(slug, songs);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`karaoke:songs:${slug}`, JSON.stringify(songs));
  }
}

async function loadPlannerApplications(
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

function resolveOwnerId(request: Request): string {
  return (request.headers.get("x-owner-id") || "").trim();
}

async function loadOwnerEventIds(env: Env, ownerId: string): Promise<string[]> {
  if (!env.QUIZ_DATA) return memoryOwnerEventIds.get(ownerId) ?? [];
  const raw = await env.QUIZ_DATA.get(`event:owner:${ownerId}`);
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw) as string[];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

async function saveOwnerEventIds(
  env: Env,
  ownerId: string,
  ids: string[],
): Promise<void> {
  memoryOwnerEventIds.set(ownerId, ids);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`event:owner:${ownerId}`, JSON.stringify(ids));
  }
}

async function registerOwnerEventId(
  env: Env,
  ownerId: string,
  eventId: string,
): Promise<void> {
  const current = await loadOwnerEventIds(env, ownerId);
  const next = [eventId, ...current.filter((x) => x !== eventId)].slice(0, 80);
  await saveOwnerEventIds(env, ownerId, next);
}

async function loadEventById(
  env: Env,
  id: string,
): Promise<EventRecord | null> {
  if (!env.QUIZ_DATA) return memoryEvents.get(id) ?? null;
  const raw = await env.QUIZ_DATA.get(`event:id:${id}`);
  if (!raw) return null;
  try {
    return parseEventRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function loadEventBySlug(
  env: Env,
  slug: string,
): Promise<EventRecord | null> {
  if (!env.QUIZ_DATA) {
    const eventId = memoryEventSlugIndex.get(slug);
    return eventId ? (memoryEvents.get(eventId) ?? null) : null;
  }
  const eventId = await env.QUIZ_DATA.get(`event:slug:${slug}`);
  if (!eventId) return null;
  return loadEventById(env, eventId);
}

async function saveEvent(env: Env, event: EventRecord): Promise<void> {
  memoryEvents.set(event.id, event);
  memoryEventSlugIndex.set(event.slug, event.id);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(`event:id:${event.id}`, JSON.stringify(event));
    await env.QUIZ_DATA.put(`event:slug:${event.slug}`, event.id);
  }
}

function buildEventRecord(
  payload: {
    title?: string;
    slug?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    timezone?: string;
    published?: boolean;
    metadata?: Record<string, string>;
  },
  ownerId: string,
): EventRecord {
  const now = new Date().toISOString();
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const startTime =
    typeof payload.startTime === "string" ? payload.startTime.trim() : "";
  const endTime =
    typeof payload.endTime === "string" ? payload.endTime.trim() : "";
  if (!title || !startTime) {
    throw new Error("Heiti og upphafstími vantar");
  }
  const parsedStart = Date.parse(startTime);
  if (Number.isNaN(parsedStart)) {
    throw new Error("Upphafstími er ógildur");
  }
  if (endTime) {
    const parsedEnd = Date.parse(endTime);
    if (Number.isNaN(parsedEnd)) {
      throw new Error("Lokatími er ógildur");
    }
    if (parsedEnd < parsedStart) {
      throw new Error("Lokatími má ekki vera á undan upphafstíma");
    }
  }
  const slugSource = payload.slug || payload.title || crypto.randomUUID();
  const slug = slugify(slugSource);
  if (!slug || slug.length < 3) {
    throw new Error("gild slóð er nauðsynleg");
  }
  return {
    id: crypto.randomUUID(),
    ownerId,
    slug,
    title,
    description:
      typeof payload.description === "string" ? payload.description.trim() : "",
    startTime,
    endTime,
    timezone:
      typeof payload.timezone === "string" ? payload.timezone.trim() : "",
    published: Boolean(payload.published),
    metadata:
      payload.metadata && typeof payload.metadata === "object"
        ? payload.metadata
        : {},
    createdAt: now,
    updatedAt: now,
  };
}

async function recordQuizAnswer(
  env: Env,
  question: QuizQuestion,
  choice: number,
  correct: boolean,
  playerId: string,
  playerName: string,
): Promise<void> {
  const summary = await loadQuizSummary(env);
  const key = String(question.id);
  const current = summary.questionStats[key] ?? {
    total: 0,
    correct: 0,
    optionCounts: Array.from({ length: question.opts.length }).map(() => 0),
  };
  current.total += 1;
  if (correct) current.correct += 1;
  if (choice >= 0 && choice < current.optionCounts.length)
    current.optionCounts[choice] += 1;
  summary.questionStats[key] = current;
  summary.totalAnswers += 1;
  if (correct) summary.totalCorrect += 1;
  await saveQuizSummary(env, summary);

  const recent = await loadRecentAnswers(env);
  recent.unshift({
    ts: new Date().toISOString(),
    questionId: question.id,
    choice,
    correct,
    playerId,
    playerName,
  });
  await saveRecentAnswers(env, recent.slice(0, 60));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/favicon.ico") {
        return new Response(null, { status: 204 });
      }

      if (url.pathname === "/api/events/create" && request.method === "POST") {
        const ownerId = resolveOwnerId(request);
        if (!ownerId) return json({ error: "Aðgangur ekki leyfður" }, 401);

        const body = await parseJsonBody(request);

        const rawTitle = readStringField(body.title, "title", 140);
        const rawHonoree = readStringField(body.honoree, "honoree", 120);
        const rawDateTime = readStringField(body.date_time, "date_time", 80);
        const rawLocation = readStringField(body.location, "location", 240);
        const rawDescription = readStringField(
          body.description,
          "description",
          1000,
        );
        const rawStartTime = readStringField(body.startTime, "startTime", 80);
        const rawSlug = readStringField(body.slug, "slug", 80);
        const rawEndTime = readStringField(body.endTime, "endTime", 80);
        const rawTimezone = readStringField(body.timezone, "timezone", 60);
        const rawPrivacy = readStringField(body.privacy, "privacy", 20);
        const mappedTitle =
          rawTitle || (rawHonoree ? `${rawHonoree}'s Party` : "");
        const mappedStartTime = rawStartTime || rawDateTime;
        const mappedDescription = rawDescription || rawLocation;
        const metadata: Record<string, string> = {};
        if (isJsonObject(body.metadata)) {
          for (const [key, value] of Object.entries(body.metadata)) {
            if (typeof value === "string") metadata[key] = value.trim();
          }
        }
        const rawType = readStringField(body.type, "type", 80);
        const rawDefaultTheme = readStringField(
          body.default_theme,
          "default_theme",
          80,
        );
        if (rawType) metadata.type = rawType;
        if (rawHonoree) metadata.honoree = rawHonoree;
        if (rawLocation) metadata.location = rawLocation;
        if (rawPrivacy) metadata.privacy = rawPrivacy;
        if (rawDefaultTheme) metadata.defaultTheme = rawDefaultTheme;

        let event: EventRecord;
        try {
          event = buildEventRecord(
            {
              title: mappedTitle,
              slug: rawSlug,
              description: mappedDescription,
              startTime: mappedStartTime,
              endTime: rawEndTime,
              timezone: rawTimezone,
              published:
                typeof body.published === "boolean"
                  ? body.published
                  : rawPrivacy
                    ? rawPrivacy === "public"
                    : false,
              metadata,
            },
            ownerId,
          );
        } catch (error) {
          return json(
            {
              error:
                error instanceof Error ? error.message : "Ógild viðburðargögn",
            },
            400,
          );
        }

        const existingBySlug = await loadEventBySlug(env, event.slug);
        if (existingBySlug)
          return json(
            { error: "Slóð er þegar í notkun", slug: event.slug },
            409,
          );

        await saveEvent(env, event);
        await registerOwnerEventId(env, ownerId, event.id);

        return json({ success: true, eventId: event.id, event }, 201);
      }

      const eventCloneMatch = url.pathname.match(
        /^\/api\/events\/([^/]+)\/clone$/,
      );
      if (eventCloneMatch && request.method === "POST") {
        const ownerId = resolveOwnerId(request);
        const admin = isAdmin(request, env);
        const effectiveOwnerId = ownerId || (admin ? "admin" : "");
        if (!effectiveOwnerId)
          return json({ error: "Aðgangur ekki leyfður" }, 401);

        let sourceEventId = "";
        try {
          sourceEventId = decodeURIComponent(eventCloneMatch[1] || "").trim();
        } catch {
          return json({ error: "Viðburðaauðkenni er ógilt" }, 400);
        }
        if (!sourceEventId)
          return json({ error: "Viðburðaauðkenni vantar" }, 400);

        const sourceEvent = await loadEventById(env, sourceEventId);
        if (!sourceEvent) return json({ error: "Viðburður fannst ekki" }, 404);

        if (
          !admin &&
          sourceEvent.ownerId !== effectiveOwnerId &&
          !sourceEvent.published
        ) {
          return json({ error: "Óheimilt" }, 403);
        }

        const body = await parseJsonBody(request, { allowEmpty: true });

        const requestedCloneSlug = readStringField(body.slug, "slug", 80);
        const cloneTitleOverride = readStringField(body.title, "title", 140);
        const cloneDescriptionOverride = readStringField(
          body.description,
          "description",
          1000,
        );
        const cloneStartTimeOverride = readStringField(
          body.startTime,
          "startTime",
          80,
        );
        const cloneEndTimeOverride = readStringField(
          body.endTime,
          "endTime",
          80,
        );
        const cloneTimezoneOverride = readStringField(
          body.timezone,
          "timezone",
          60,
        );
        const baseSlug = slugify(
          requestedCloneSlug || `${sourceEvent.slug}-copy`,
        );
        if (!baseSlug) return json({ error: "gild slóð er nauðsynleg" }, 400);
        let nextSlug = baseSlug;
        let suffix = 2;
        while (await loadEventBySlug(env, nextSlug)) {
          nextSlug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }

        let clone: EventRecord;
        try {
          clone = buildEventRecord(
            {
              title: cloneTitleOverride || `${sourceEvent.title} (Afrit)`,
              slug: nextSlug,
              description: cloneDescriptionOverride || sourceEvent.description,
              startTime: cloneStartTimeOverride || sourceEvent.startTime,
              endTime: cloneEndTimeOverride || sourceEvent.endTime,
              timezone: cloneTimezoneOverride || sourceEvent.timezone,
              published: false,
              metadata: {
                ...(sourceEvent.metadata ?? {}),
                ...(isJsonObject(body.metadata)
                  ? Object.fromEntries(
                      Object.entries(body.metadata).filter(
                        ([, value]) => typeof value === "string",
                      ),
                    )
                  : {}),
                clonedFromEventId: sourceEvent.id,
              },
            },
            effectiveOwnerId,
          );
        } catch (error) {
          return json(
            {
              error:
                error instanceof Error ? error.message : "Ógild afritunargögn",
            },
            400,
          );
        }

        await saveEvent(env, clone);
        await registerOwnerEventId(env, effectiveOwnerId, clone.id);

        if (env.QUIZ_DATA) {
          const copiedKeys: string[] = [];
          for (const suffixToCopy of [
            "links",
            "schedule",
            "settings",
            "secret_timeline",
            "quiz_meta",
            "photo_meta",
          ]) {
            const sourceValue = await env.QUIZ_DATA.get(
              `event:${sourceEvent.id}:${suffixToCopy}`,
            );
            if (sourceValue !== null) {
              await env.QUIZ_DATA.put(
                `event:${clone.id}:${suffixToCopy}`,
                sourceValue,
              );
              copiedKeys.push(suffixToCopy);
            }
          }
          return json(
            {
              success: true,
              sourceEventId: sourceEvent.id,
              eventId: clone.id,
              event: clone,
              copiedKeys,
            },
            201,
          );
        }

        return json(
          {
            success: true,
            sourceEventId: sourceEvent.id,
            eventId: clone.id,
            event: clone,
            copiedKeys: [],
          },
          201,
        );
      }

      if (url.pathname === "/api/dashboard/me" && request.method === "GET") {
        const ownerId = resolveOwnerId(request);
        if (!ownerId) return json({ error: "Aðgangur ekki leyfður" }, 401);

        const ids = await loadOwnerEventIds(env, ownerId);
        const loaded = await Promise.all(
          ids.map(async (id) => loadEventById(env, id)),
        );
        const events = loaded
          .filter((event): event is EventRecord => Boolean(event))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const drafts = events.filter((event) => !event.published);
        const published = events.filter((event) => event.published);

        return json({
          ownerId,
          total: events.length,
          events,
          adminEvents: events,
          drafts,
          published,
          templates: [],
        });
      }

      const publicEventMatch = url.pathname.match(
        /^\/api\/events\/([^/]+)\/public$/,
      );
      if (publicEventMatch && request.method === "GET") {
        let rawSlug = "";
        try {
          rawSlug = decodeURIComponent(publicEventMatch[1] || "").trim();
        } catch {
          return json({ error: "slug is invalid" }, 400);
        }
        const slug = slugify(rawSlug);
        if (!slug) return json({ error: "Slóð vantar" }, 400);

        const event = await loadEventBySlug(env, slug);
        if (!event || !event.published)
          return json({ error: "Viðburður fannst ekki" }, 404);

        return json({
          event: {
            id: event.id,
            slug: event.slug,
            title: event.title,
            description: event.description ?? "",
            startTime: event.startTime,
            date_time: event.startTime,
            endTime: event.endTime ?? "",
            timezone: event.timezone ?? "",
            published: event.published,
            metadata: event.metadata ?? {},
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
          },
          cta: {
            canRsvp: true,
            canPlayQuiz: true,
            canViewPhotoWall: true,
            canApplyAsPlanner: true,
            canClone: true,
          },
        });
      }

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

      if (url.pathname === "/api/quiz/questions" && request.method === "GET") {
        const all = await getAllQuestions(env);
        return json({
          total: all.length,
          questions: sanitizeQuestions(all),
        });
      }

      if (url.pathname === "/api/quiz/question" && request.method === "GET") {
        const idParam = url.searchParams.get("id");
        const id = idParam ? Number(idParam) : NaN;
        if (!Number.isInteger(id)) {
          return json({ error: "Auðkenni í fyrirspurn vantar" }, 400);
        }
        const all = await getAllQuestions(env);
        const question = all.find((q) => q.id === id);
        if (!question) return json({ error: "Question not found" }, 404);
        const safe = { ...question };
        delete (safe as Partial<QuizQuestion>).ans;
        return json({ question: safe });
      }

      if (url.pathname === "/api/quiz/answer" && request.method === "POST") {
        const body = await parseJsonBody(request);
        if (!Number.isInteger(body.id) || !Number.isInteger(body.choice)) {
          throw new HttpError(400, "Auðkenni og valkostsvísir vantar");
        }
        const questionId = Number(body.id);
        const choice = Number(body.choice);
        const all = await getAllQuestions(env);
        const question = all.find((q) => q.id === questionId);
        if (!question) return json({ error: "Question not found" }, 404);
        if (choice < 0 || choice >= question.opts.length) {
          throw new HttpError(400, "Valkostsvísir er utan marka");
        }
        const isCorrect = question.ans === choice;
        const playerId =
          readStringField(body.playerId, "playerId", 100) || "anon";
        const playerName =
          readStringField(body.playerName, "playerName", 120) || "Guest";
        await recordQuizAnswer(
          env,
          question,
          choice,
          isCorrect,
          playerId,
          playerName,
        );

        // Gamification: update player stats, streak, and points
        const stats = await loadPlayerStats(env, playerId);
        stats.playerName = playerName;
        stats.totalAnswers += 1;
        if (isCorrect) stats.totalCorrect += 1;
        const { streakReset } = updatePlayerStreak(stats);
        const { points, streakBonus } = calculatePointsEarned(
          isCorrect,
          stats.currentStreak,
        );
        stats.totalPoints += points + streakBonus;
        stats.lastAnswerDate = new Date().toISOString().split("T")[0];
        await savePlayerStats(env, stats);

        return json({
          id: question.id,
          correct: isCorrect,
          correctIndex: question.ans,
          explanation: question.exp,
          funFact: question.fun,
          gamification: {
            pointsEarned: points + streakBonus,
            basePoints: points,
            streakBonus,
            currentStreak: stats.currentStreak,
            bestStreak: stats.bestStreak,
            totalPoints: stats.totalPoints,
            streakReset,
          },
        });
      }

      // ── Leaderboard & Player Stats ────────────────────────────────

      if (
        url.pathname === "/api/quiz/leaderboard" &&
        request.method === "GET"
      ) {
        const leaders = await loadLeaderboard(env);
        return json({
          leaderboard: leaders.map((p, i) => ({
            rank: i + 1,
            playerName: p.playerName,
            totalPoints: p.totalPoints,
            currentStreak: p.currentStreak,
            bestStreak: p.bestStreak,
            totalCorrect: p.totalCorrect,
            totalAnswers: p.totalAnswers,
            accuracy:
              p.totalAnswers > 0
                ? Math.round((p.totalCorrect / p.totalAnswers) * 100)
                : 0,
          })),
        });
      }

      if (url.pathname === "/api/quiz/player" && request.method === "GET") {
        const pid = url.searchParams.get("id") || "anon";
        const stats = await loadPlayerStats(env, pid);
        return json({
          player: {
            playerId: stats.playerId,
            playerName: stats.playerName,
            totalPoints: stats.totalPoints,
            currentStreak: stats.currentStreak,
            bestStreak: stats.bestStreak,
            totalCorrect: stats.totalCorrect,
            totalAnswers: stats.totalAnswers,
            accuracy:
              stats.totalAnswers > 0
                ? Math.round((stats.totalCorrect / stats.totalAnswers) * 100)
                : 0,
          },
        });
      }

      // ── Quiz Admin ──────────────────────────────────────────────

      if (
        url.pathname === "/api/quiz/admin/question" &&
        request.method === "POST"
      ) {
        if (!isAdmin(request, env))
          return json({ error: "Aðgangur ekki leyfður" }, 401);
        const body = await parseJsonBody(request);
        const q = readStringField(body.q, "q", 300, true);
        const cat = readStringField(body.cat, "cat", 80, true);
        if (
          !Array.isArray(body.opts) ||
          body.opts.length < 2 ||
          body.opts.length > 8
        ) {
          throw new HttpError(400, "opts þarf að vera fylki með 2-8 valkostum");
        }
        const opts = body.opts.map((opt, index) =>
          readStringField(opt, `opts[${index}]`, 160, true),
        );
        if (!Number.isInteger(body.ans))
          throw new HttpError(400, "ans þarf að vera heiltala");
        const answerIndex = Number(body.ans);
        if (answerIndex < 0 || answerIndex >= opts.length) {
          throw new HttpError(400, "ans index out of range");
        }
        if (!Number.isInteger(body.yr)) {
          throw new HttpError(400, "yr þarf að vera gilt ár");
        }
        const year = Number(body.yr);
        if (year < 1900 || year > 2100) {
          throw new HttpError(400, "yr þarf að vera gilt ár");
        }
        const hint = readStringField(body.hint, "hint", 300);
        const exp = readStringField(body.exp, "exp", 1000);
        const fun = readStringField(body.fun, "fun", 1000);
        const all = await getAllQuestions(env);
        const maxId = all.reduce((m, q) => Math.max(m, q.id), 0);
        const nextId = maxId + 1;
        const question: QuizQuestion = {
          id: nextId,
          yr: year,
          cat,
          q,
          hint: hint || undefined,
          opts,
          ans: answerIndex,
          exp: exp || "Added by admin.",
          fun: fun || "Custom question",
        };
        await saveCustomQuizQuestion(env, question);
        return json({ success: true, question }, 201);
      }

      if (
        url.pathname === "/api/quiz/admin/question" &&
        request.method === "DELETE"
      ) {
        if (!isAdmin(request, env))
          return json({ error: "Aðgangur ekki leyfður" }, 401);
        const idParam = url.searchParams.get("id");
        const id = idParam ? Number(idParam) : NaN;
        if (!Number.isInteger(id))
          return json({ error: "Auðkenni í fyrirspurn vantar" }, 400);
        if (quizQuestions.some((q) => q.id === id)) {
          return json(
            {
              error:
                "Base questions cannot be deleted. Only admin-added questions can be deleted.",
            },
            400,
          );
        }
        await deleteCustomQuizQuestion(env, id);
        return json({ success: true, id });
      }

      if (url.pathname === "/api/admin/overview" && request.method === "GET") {
        if (!isAdmin(request, env))
          return json({ error: "Aðgangur ekki leyfður" }, 401);
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const rsvps = (await loadAllRsvps(env)).sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        );
        const attending = rsvps.filter((r) => r.attending);
        const notAttending = rsvps.filter((r) => !r.attending);
        const totalHeads = attending.reduce(
          (sum, r) => sum + (r.partySize ?? 1),
          0,
        );
        const summary = await loadQuizSummary(env);
        const recent = await loadRecentAnswers(env);
        const plannerItems = await loadPlannerApplications(env, slug);
        const questionEntries = Object.entries(summary.questionStats).map(
          ([id, s]) => ({
            id: Number(id),
            total: s.total,
            correct: s.correct,
            accuracy: s.total ? s.correct / s.total : 0,
            optionCounts: s.optionCounts,
          }),
        );
        const hardest = questionEntries
          .filter((x) => x.total > 0)
          .sort((a, b) => a.accuracy - b.accuracy)[0];
        return json({
          generatedAt: new Date().toISOString(),
          attendees: {
            totalInvitedResponses: rsvps.length,
            attending: attending.length,
            notAttending: notAttending.length,
            totalHeads,
            humor:
              totalHeads > 40
                ? "Big party energy detected. DJ on standby."
                : "Still room on the dance floor.",
            list: rsvps,
          },
          quiz: {
            totalAnswers: summary.totalAnswers,
            totalCorrect: summary.totalCorrect,
            overallAccuracy: summary.totalAnswers
              ? summary.totalCorrect / summary.totalAnswers
              : 0,
            hardestQuestionId: hardest?.id ?? null,
            byQuestion: questionEntries,
            recentAnswers: recent,
          },
          planner: {
            slug,
            total: plannerItems.length,
            hostAdds: plannerItems.filter((x) => x.type === "host_add").length,
            surpriseHelps: plannerItems.filter(
              (x) => x.type === "surprise_help",
            ).length,
            recent: plannerItems.slice(0, 12),
          },
        });
      }

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

      // ── MySelfie API ──────────────────────────────────────
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

      // ── MyKaraoke API ─────────────────────────────────────
      if (url.pathname === "/api/karaoke/songs" && request.method === "GET") {
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const songs = await loadKaraokeSongs(env, slug);
        return json({
          slug,
          total: songs.length,
          songs: songs.map((song) => {
            const sanitized = { ...song };
            delete (sanitized as { audioKey?: string }).audioKey;
            return sanitized;
          }),
        });
      }

      if (url.pathname === "/api/karaoke/song" && request.method === "GET") {
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id vantar" }, 400);
        const songs = await loadKaraokeSongs(env, slug);
        const song = songs.find((s) => s.id === id);
        if (!song) return json({ error: "Lag fannst ekki" }, 404);
        const meta = { ...song };
        delete (meta as { audioKey?: string }).audioKey;
        return json(meta);
      }

      if (url.pathname === "/api/karaoke/audio" && request.method === "GET") {
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id vantar" }, 400);
        const songs = await loadKaraokeSongs(env, slug);
        const song = songs.find((s) => s.id === id);
        if (!song) return json({ error: "Lag fannst ekki" }, 404);
        const audioKey = `karaoke:audio:${slug}:${id}`;
        let audioData: string | null = null;
        if (env.QUIZ_DATA) {
          audioData = await env.QUIZ_DATA.get(audioKey);
        } else {
          audioData = memoryKaraokeAudio.get(audioKey) ?? null;
        }
        if (!audioData) return json({ error: "Hljóðskrá fannst ekki" }, 404);
        return json({ audioBase64: audioData });
      }

      if (url.pathname === "/api/karaoke/upload" && request.method === "POST") {
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const body = (await request.json()) as {
          title?: string;
          artist?: string;
          addedBy?: string;
          audioBase64?: string;
        };
        if (!body.title || !body.addedBy || !body.audioBase64) {
          return json(
            { error: "title, addedBy og audioBase64 eru nauðsynleg" },
            400,
          );
        }
        if (body.audioBase64.length > 14_000_000) {
          return json({ error: "Hljóðskrá of stór (hámark ~10MB)" }, 400);
        }
        const id = crypto.randomUUID();
        const audioKey = `karaoke:audio:${slug}:${id}`;
        if (env.QUIZ_DATA) {
          await env.QUIZ_DATA.put(audioKey, body.audioBase64);
        } else {
          memoryKaraokeAudio.set(audioKey, body.audioBase64);
        }
        const song: KaraokeSong = {
          id,
          title: body.title,
          artist: body.artist || "",
          audioKey,
          addedBy: body.addedBy,
          createdAt: new Date().toISOString(),
          status: "uploaded",
        };
        const songs = await loadKaraokeSongs(env, slug);
        songs.push(song);
        await saveKaraokeSongs(env, slug, songs);
        return json({ success: true, song: { ...song, audioKey: undefined } }, 201);
      }

      if (
        url.pathname === "/api/karaoke/transcribe" &&
        request.method === "POST"
      ) {
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id vantar" }, 400);
        if (!env.AI) return json({ error: "AI binding ekki stillt" }, 500);
        const songs = await loadKaraokeSongs(env, slug);
        const idx = songs.findIndex((s) => s.id === id);
        if (idx === -1) return json({ error: "Lag fannst ekki" }, 404);
        songs[idx].status = "transcribing";
        await saveKaraokeSongs(env, slug, songs);
        try {
          const audioKey = `karaoke:audio:${slug}:${id}`;
          let audioB64: string | null = null;
          if (env.QUIZ_DATA) {
            audioB64 = await env.QUIZ_DATA.get(audioKey);
          } else {
            audioB64 = memoryKaraokeAudio.get(audioKey) ?? null;
          }
          if (!audioB64) {
            songs[idx].status = "error";
            await saveKaraokeSongs(env, slug, songs);
            return json({ error: "Hljóðskrá fannst ekki" }, 404);
          }
          const raw = audioB64.includes(",")
            ? audioB64.split(",")[1]
            : audioB64;
          const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
          const result = (await env.AI.run("@cf/openai/whisper", {
            audio: [...bytes],
          })) as {
            text?: string;
            words?: { word: string; start: number; end: number }[];
          };
          const segments: TranscriptSegment[] = result.words
            ? result.words.map((w) => ({
                word: w.word,
                start: w.start,
                end: w.end,
              }))
            : (result.text || "")
                .split(/\s+/)
                .filter(Boolean)
                .map((w, i) => ({ word: w, start: i * 0.5, end: i * 0.5 + 0.4 }));
          songs[idx].lyrics = segments;
          songs[idx].status = "ready";
          await saveKaraokeSongs(env, slug, songs);
          return json({ success: true, segmentCount: segments.length });
        } catch (err) {
          songs[idx].status = "error";
          await saveKaraokeSongs(env, slug, songs);
          return json(
            { error: "Umritun mistókst", detail: String(err) },
            500,
          );
        }
      }

      if (url.pathname === "/api/karaoke/lyrics" && request.method === "POST") {
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id vantar" }, 400);
        const body = (await request.json()) as { lyrics?: string };
        if (!body.lyrics) return json({ error: "lyrics vantar" }, 400);
        const songs = await loadKaraokeSongs(env, slug);
        const idx = songs.findIndex((s) => s.id === id);
        if (idx === -1) return json({ error: "Lag fannst ekki" }, 404);
        songs[idx].manualLyrics = body.lyrics;
        if (songs[idx].status === "uploaded") songs[idx].status = "ready";
        await saveKaraokeSongs(env, slug, songs);
        return json({ success: true });
      }

      if (
        url.pathname === "/api/karaoke/song" &&
        request.method === "DELETE"
      ) {
        if (!isAdmin(request, env))
          return json({ error: "Aðgangur ekki leyfður" }, 401);
        const slug = slugify(url.searchParams.get("slug") || "omars50");
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id vantar" }, 400);
        const songs = await loadKaraokeSongs(env, slug);
        const song = songs.find((s) => s.id === id);
        if (!song) return json({ error: "Lag fannst ekki" }, 404);
        const filtered = songs.filter((s) => s.id !== id);
        await saveKaraokeSongs(env, slug, filtered);
        const audioKey = `karaoke:audio:${slug}:${id}`;
        if (env.QUIZ_DATA) {
          await env.QUIZ_DATA.delete(audioKey);
        } else {
          memoryKaraokeAudio.delete(audioKey);
        }
        return json({ success: true, deleted: id });
      }

      if (url.pathname.startsWith("/api/")) {
        return json({ error: "Not found" }, 404);
      }

      const slug = getSlugFromPath(url.pathname);
      const html = HTML.replace(
        "</head>",
        `<script>window.__APP_SLUG__=${JSON.stringify(slug || "")};</script></head>`,
      );

      return new Response(html, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=300",
          "X-Powered-By": "2076 ehf",
        },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
      }
      console.error("Unhandled request error", error);
      if (url.pathname.startsWith("/api/")) {
        return json({ error: "Innri villa á netþjóni" }, 500);
      }
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
