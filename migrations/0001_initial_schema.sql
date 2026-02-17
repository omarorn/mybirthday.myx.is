-- 0001_initial_schema.sql
-- D1 migration: create all tables for birthday portal

-- 1. rsvp
CREATE TABLE IF NOT EXISTS rsvp (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'sms',
  attending INTEGER DEFAULT 1,
  party_size INTEGER DEFAULT 1,
  plus_one TEXT,
  dietary TEXT,
  note TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rsvp_slug ON rsvp(slug);

-- 2. quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  answer INTEGER NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_slug ON quiz_questions(slug);

-- 3. quiz_answers
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  choice INTEGER NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_slug ON quiz_answers(slug);

-- 4. player_stats
CREATE TABLE IF NOT EXISTS player_stats (
  player_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  player_name TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  last_answer_date TEXT,
  PRIMARY KEY (player_id, slug)
);

-- 5. events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT,
  timezone TEXT DEFAULT 'Atlantic/Reykjavik',
  published INTEGER DEFAULT 0,
  metadata TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_owner ON events(owner_id);

-- 6. tenants
CREATE TABLE IF NOT EXISTS tenants (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  hashtag TEXT NOT NULL,
  instagram_handle TEXT,
  owner TEXT,
  created_at TEXT NOT NULL
);

-- 7. photos
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  source_url TEXT,
  added_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_slug ON photos(slug);

-- 8. planner_applications
CREATE TABLE IF NOT EXISTS planner_applications (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  type TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  for_guest TEXT,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_planner_slug ON planner_applications(slug);

-- 9. selfies
CREATE TABLE IF NOT EXISTS selfies (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  image_key TEXT NOT NULL,
  caption TEXT,
  submitted_by TEXT NOT NULL,
  taken_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_selfies_slug ON selfies(slug);

-- 10. karaoke_songs
CREATE TABLE IF NOT EXISTS karaoke_songs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  audio_key TEXT,
  lyrics TEXT,
  manual_lyrics TEXT,
  duration REAL,
  chords TEXT,
  preset INTEGER DEFAULT 0,
  added_by TEXT NOT NULL,
  status TEXT DEFAULT 'uploaded',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_karaoke_slug ON karaoke_songs(slug);
