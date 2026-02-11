-- Quiz Game Module: Database Schema
-- Apply with: npx wrangler d1 execute {{DATABASE_NAME}} --remote --file=migrations/001_quiz_tables.sql

CREATE TABLE IF NOT EXISTS quiz_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT UNIQUE NOT NULL,
  icon_key TEXT,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  reason TEXT,
  times_shown INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  approved INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_hash TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'timed',
  time_seconds INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_scores_mode ON quiz_scores(mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_images_category ON quiz_images(category);
CREATE INDEX IF NOT EXISTS idx_quiz_images_shown ON quiz_images(times_shown ASC);
