// Quiz Game Types

export interface QuizQuestion {
  id: number;
  imageUrl: string;
  iconUrl?: string;
  item: string;
  category: string;
  options: QuizOption[];
}

export interface QuizOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface QuizAnswer {
  correct: boolean;
  correctAnswer: string;
  item: string;
  reason: string;
  points: number;
  streakBonus: number;
}

export interface QuizScore {
  id: number;
  user_hash: string;
  score: number;
  total_questions: number;
  mode: 'timed' | 'survival' | 'learning';
  time_seconds?: number;
  created_at: string;
}

export interface QuizStats {
  total_images: number;
  total_played: number;
  total_correct: number;
  accuracy_percent: number;
}

export type GameMode = 'menu' | 'timed' | 'survival' | 'learning';
export type GameState = 'playing' | 'feedback' | 'gameover' | 'leaderboard';
