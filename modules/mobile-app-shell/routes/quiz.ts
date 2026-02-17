/**
 * Quiz route handlers, gamification, and persistence.
 */

import type {
  Env,
  QuizSummary,
  QuizRecentAnswer,
  PlayerStats,
} from "../types";
import { HttpError } from "../types";
import type { QuizQuestion } from "../quizData";
import { quizQuestions } from "../quizData";
import {
  json,
  parseJsonBody,
  readStringField,
  sanitizeQuestions,
  parseQuizSummary,
  parseRecentAnswers,
  isAdmin,
} from "../helpers";
import {
  memoryCustomQuestions,
  memoryPlayerStats,
  getMemoryQuizSummary,
  setMemoryQuizSummary,
  getMemoryRecentAnswers,
  setMemoryRecentAnswers,
} from "../state";

// ── Custom question persistence ─────────────────────────────────

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

// ── Quiz stats persistence ──────────────────────────────────────

export async function loadQuizSummary(env: Env): Promise<QuizSummary> {
  if (!env.QUIZ_DATA) return getMemoryQuizSummary();
  const raw = await env.QUIZ_DATA.get("quiz_stats:summary");
  if (!raw) return getMemoryQuizSummary();
  try {
    const parsed = parseQuizSummary(JSON.parse(raw));
    return parsed ?? getMemoryQuizSummary();
  } catch {
    return getMemoryQuizSummary();
  }
}

async function saveQuizSummary(env: Env, summary: QuizSummary): Promise<void> {
  setMemoryQuizSummary(summary);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put("quiz_stats:summary", JSON.stringify(summary));
  }
}

export async function loadRecentAnswers(
  env: Env,
): Promise<QuizRecentAnswer[]> {
  if (!env.QUIZ_DATA) return getMemoryRecentAnswers();
  const raw = await env.QUIZ_DATA.get("quiz_stats:recent_answers");
  if (!raw) return getMemoryRecentAnswers();
  try {
    const parsed = parseRecentAnswers(JSON.parse(raw));
    return parsed ?? getMemoryRecentAnswers();
  } catch {
    return getMemoryRecentAnswers();
  }
}

async function saveRecentAnswers(
  env: Env,
  answers: QuizRecentAnswer[],
): Promise<void> {
  setMemoryRecentAnswers(answers);
  if (env.QUIZ_DATA) {
    await env.QUIZ_DATA.put(
      "quiz_stats:recent_answers",
      JSON.stringify(answers),
    );
  }
}

// ── Gamification helpers ────────────────────────────────────────

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

// ── Record answer helper ────────────────────────────────────────

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

// ── Route handler ───────────────────────────────────────────────

export async function handleQuizRoutes(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response | null> {
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
    const opts = body.opts.map((opt: unknown, index: number) =>
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
    const maxId = all.reduce((m, qq) => Math.max(m, qq.id), 0);
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
    if (quizQuestions.some((qq) => qq.id === id)) {
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

  return null;
}
