-- CMS Module: Database Schema
-- Apply with: npx wrangler d1 execute {{DATABASE_NAME}} --remote --file=migrations/001_cms_tables.sql

CREATE TABLE IF NOT EXISTS cms_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key TEXT UNIQUE NOT NULL,
  section_name TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'content',
  content_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  is_published INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT NOT NULL DEFAULT 'system',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_section_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key TEXT NOT NULL,
  version INTEGER NOT NULL,
  content_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  change_summary TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (section_key) REFERENCES cms_sections(section_key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cms_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT UNIQUE NOT NULL,
  image_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'photo',
  section_key TEXT,
  alt_text TEXT,
  uploaded_by TEXT NOT NULL DEFAULT 'system',
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (section_key) REFERENCES cms_sections(section_key) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_history_key ON cms_section_history(section_key);
CREATE INDEX IF NOT EXISTS idx_cms_images_section ON cms_images(section_key);
CREATE INDEX IF NOT EXISTS idx_cms_images_type ON cms_images(image_type);
