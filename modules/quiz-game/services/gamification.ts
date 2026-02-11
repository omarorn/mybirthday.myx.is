/**
 * Gamification Service
 * Extracted from: rusl.myx.is (production)
 *
 * Points calculation, streak tracking, and bonus logic.
 * Framework-agnostic — works with any database.
 */

export interface UserStats {
  total_points: number;
  current_streak: number;
  best_streak: number;
  total_scans: number;
  last_scan_date: string | null;
}

export interface PointsResult {
  points: number;
  streakBonus: number;
  totalPoints: number;
  newStreak: number;
  isNewBestStreak: boolean;
}

const BASE_POINTS = 10;
const MAX_STREAK_BONUS = 20;

/**
 * Calculate points for a correct answer.
 * Streak bonus: current_streak * 2 (capped at MAX_STREAK_BONUS)
 */
export function calculatePoints(currentStreak: number): PointsResult {
  const streakBonus = Math.min(currentStreak * 2, MAX_STREAK_BONUS);
  return {
    points: BASE_POINTS,
    streakBonus,
    totalPoints: BASE_POINTS + streakBonus,
    newStreak: currentStreak + 1,
    isNewBestStreak: false, // Caller determines this
  };
}

/**
 * Update daily streak based on last scan date.
 * Resets if user skips a day.
 */
export function updateStreak(stats: UserStats): {
  currentStreak: number;
  bestStreak: number;
  streakReset: boolean;
} {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = stats.last_scan_date;

  if (!lastDate) {
    // First scan ever
    return { currentStreak: 1, bestStreak: 1, streakReset: false };
  }

  const lastDay = new Date(lastDate);
  const todayDay = new Date(today);
  const diffDays = Math.floor(
    (todayDay.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    // Same day — no streak change
    return {
      currentStreak: stats.current_streak,
      bestStreak: stats.best_streak,
      streakReset: false,
    };
  }

  if (diffDays === 1) {
    // Consecutive day — extend streak
    const newStreak = stats.current_streak + 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, stats.best_streak),
      streakReset: false,
    };
  }

  // Gap > 1 day — reset streak
  return {
    currentStreak: 1,
    bestStreak: stats.best_streak,
    streakReset: true,
  };
}

/**
 * Get fun fact (placeholder — connect to your database or API)
 */
export function getRandomFunFact(facts: string[]): string | null {
  if (!facts.length) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}
