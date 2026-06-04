-- English Journal — notas de voz/texto e revisão espaçada

CREATE TABLE IF NOT EXISTS journal_entries (
  id text PRIMARY KEY NOT NULL,
  entry_type text NOT NULL,
  title text NOT NULL,
  body text,
  category text NOT NULL,
  importance text NOT NULL DEFAULT 'medium',
  tags_json text NOT NULL DEFAULT '[]',
  audio_uri text,
  audio_duration_ms integer,
  is_favorite integer DEFAULT 0 NOT NULL,
  is_archived integer DEFAULT 0 NOT NULL,
  review_stage integer DEFAULT 0 NOT NULL,
  review_count integer DEFAULT 0 NOT NULL,
  next_review_at text,
  last_reviewed_at text,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_created ON journal_entries (created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON journal_entries (category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_favorite ON journal_entries (is_favorite);
CREATE INDEX IF NOT EXISTS idx_journal_entries_next_review ON journal_entries (next_review_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_archived ON journal_entries (is_archived);

CREATE TABLE IF NOT EXISTS journal_stats (
  id integer PRIMARY KEY NOT NULL,
  total_entries integer DEFAULT 0 NOT NULL,
  total_voice_notes integer DEFAULT 0 NOT NULL,
  total_text_notes integer DEFAULT 0 NOT NULL,
  total_reviews integer DEFAULT 0 NOT NULL,
  total_voice_ms integer DEFAULT 0 NOT NULL,
  total_xp_from_journal integer DEFAULT 0 NOT NULL,
  knowledge_progress integer DEFAULT 0 NOT NULL,
  updated_at text NOT NULL
);

INSERT OR IGNORE INTO journal_stats (
  id,
  total_entries,
  total_voice_notes,
  total_text_notes,
  total_reviews,
  total_voice_ms,
  total_xp_from_journal,
  knowledge_progress,
  updated_at
) VALUES (1, 0, 0, 0, 0, 0, 0, 0, datetime('now'));

ALTER TABLE achievement_stats ADD COLUMN total_journal_entries integer DEFAULT 0 NOT NULL;
ALTER TABLE achievement_stats ADD COLUMN total_journal_voice_notes integer DEFAULT 0 NOT NULL;
ALTER TABLE achievement_stats ADD COLUMN total_journal_reviews integer DEFAULT 0 NOT NULL;
