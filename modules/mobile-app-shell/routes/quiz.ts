/**
 * Quiz route handlers, gamification, and D1 persistence.
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
  isAdmin,
} from "../helpers";

const DEFAULT_SLUG = "global";

// ── Row mapping ─────────────────────────────────────────────────

function rowToQuestion(row: Record<string, unknown>): QuizQuestion {
  return {
    id: row.id as number,
    yr: (row.year as number) || 0,
    cat: (row.category as string) || "",
    q: row.question as string,
    hint: (row.hint as string) || undefined,
    opts: JSON.parse(row.options as string) as string[],
    ans: row.answer as number,
    exp: (row.explanation as string) || "",
    fun: (row.fun_fact as string) || "",
  };
}

function rowToPlayerStats(row: Record<string, unknown>): PlayerStats {
  return {
    playerId: row.player_id as string,
    playerName: row.player_name as string,
    totalPoints: (row.total_points as number) || 0,
    currentStreak: (row.current_streak as number) || 0,
    bestStreak: (row.best_streak as number) || 0,
    totalAnswers: (row.total_answers as number) || 0,
    totalCorrect: (row.total_correct as number) || 0,
    lastAnswerDate: (row.last_answer_date as string) || null,
  };
}

// ── Custom question persistence (D1) ────────────────────────────

async function loadCustomQuizQuestions(env: Env): Promise<QuizQuestion[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM quiz_questions WHERE slug = ? ORDER BY id ASC",
  )
    .bind(DEFAULT_SLUG)
    .all();
  return (result.results ?? []).map(rowToQuestion);
}

async function saveCustomQuizQuestion(
  env: Env,
  question: QuizQuestion,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO quiz_questions (id, slug, question, options, answer, category, created_at, year, hint, explanation, fun_fact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      question.id,
      DEFAULT_SLUG,
      question.q,
      JSON.stringify(question.opts),
      question.ans,
      question.cat || "",
      new Date().toISOString(),
      question.yr || null,
      question.hint || null,
      question.exp || null,
      question.fun || null,
    )
    .run();
}

async function deleteCustomQuizQuestion(env: Env, id: number): Promise<void> {
  await env.DB.prepare(
    "DELETE FROM quiz_questions WHERE id = ? AND slug = ?",
  )
    .bind(id, DEFAULT_SLUG)
    .run();
}

async function getAllQuestions(env: Env): Promise<QuizQuestion[]> {
  const custom = await loadCustomQuizQuestions(env);
  return [...quizQuestions, ...custom].sort((a, b) => a.id - b.id);
}

// ── Quiz stats (computed from D1) ───────────────────────────────

export async function loadQuizSummary(env: Env): Promise<QuizSummary> {
  const result = await env.DB.prepare(
    `SELECT question_id, choice, COUNT(*) as cnt, SUM(correct) as correct_cnt
     FROM quiz_answers WHERE slug = ?
     GROUP BY question_id, choice
     ORDER BY question_id, choice`,
  )
    .bind(DEFAULT_SLUG)
    .all();

  let totalAnswers = 0;
  let totalCorrect = 0;
  const questionStats: Record<
    string,
    { total: number; correct: number; optionCounts: number[] }
  > = {};

  for (const row of result.results ?? []) {
    const qid = String(row.question_id);
    const choice = row.choice as number;
    const cnt = row.cnt as number;
    const correctCnt = row.correct_cnt as number;

    if (!questionStats[qid]) {
      questionStats[qid] = { total: 0, correct: 0, optionCounts: [] };
    }
    questionStats[qid].total += cnt;
    questionStats[qid].correct += correctCnt;
    while (questionStats[qid].optionCounts.length <= choice) {
      questionStats[qid].optionCounts.push(0);
    }
    questionStats[qid].optionCounts[choice] = cnt;
    totalAnswers += cnt;
    totalCorrect += correctCnt;
  }

  return { totalAnswers, totalCorrect, questionStats };
}

export async function loadRecentAnswers(
  env: Env,
): Promise<QuizRecentAnswer[]> {
  const result = await env.DB.prepare(
    `SELECT player_id, player_name, question_id, choice, correct, created_at
     FROM quiz_answers WHERE slug = ?
     ORDER BY created_at DESC LIMIT 60`,
  )
    .bind(DEFAULT_SLUG)
    .all();

  return (result.results ?? []).map((row) => ({
    ts: row.created_at as string,
    questionId: row.question_id as number,
    choice: row.choice as number,
    correct: Boolean(row.correct),
    playerId: row.player_id as string,
    playerName: row.player_name as string,
  }));
}

async function recordQuizAnswer(
  env: Env,
  question: QuizQuestion,
  choice: number,
  correct: boolean,
  playerId: string,
  playerName: string,
): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO quiz_answers (slug, player_id, player_name, question_id, choice, correct, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      DEFAULT_SLUG,
      playerId,
      playerName,
      question.id,
      choice,
      correct ? 1 : 0,
      now,
    )
    .run();
}

// ── Gamification helpers ────────────────────────────────────────

const BASE_POINTS = 10;
const MAX_STREAK_BONUS = 20;

async function loadPlayerStats(
  env: Env,
  playerId: string,
): Promise<PlayerStats> {
  const row = await env.DB.prepare(
    "SELECT * FROM player_stats WHERE player_id = ? AND slug = ?",
  )
    .bind(playerId, DEFAULT_SLUG)
    .first();
  if (!row) {
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
  return rowToPlayerStats(row as Record<string, unknown>);
}

async function savePlayerStats(env: Env, stats: PlayerStats): Promise<void> {
  await env.DB.prepare(
    `INSERT OR REPLACE INTO player_stats (player_id, slug, player_name, total_points, current_streak, best_streak, total_answers, total_correct, last_answer_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      stats.playerId,
      DEFAULT_SLUG,
      stats.playerName,
      stats.totalPoints,
      stats.currentStreak,
      stats.bestStreak,
      stats.totalAnswers,
      stats.totalCorrect,
      stats.lastAnswerDate,
    )
    .run();
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
  const result = await env.DB.prepare(
    "SELECT * FROM player_stats WHERE slug = ? ORDER BY total_points DESC LIMIT 50",
  )
    .bind(DEFAULT_SLUG)
    .all();
  return (result.results ?? []).map(rowToPlayerStats);
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
