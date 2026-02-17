-- 0002_add_extra_columns.sql
-- Add missing columns for quiz questions and karaoke songs

-- Quiz question extras (yr, hint, explanation, fun_fact)
ALTER TABLE quiz_questions ADD COLUMN year INTEGER;
ALTER TABLE quiz_questions ADD COLUMN hint TEXT;
ALTER TABLE quiz_questions ADD COLUMN explanation TEXT;
ALTER TABLE quiz_questions ADD COLUMN fun_fact TEXT;

-- Karaoke song extras (transcription, vtt)
ALTER TABLE karaoke_songs ADD COLUMN transcription TEXT;
ALTER TABLE karaoke_songs ADD COLUMN vtt TEXT;
