-- Chama Interior v1.1 — coleções, stats de abertura

CREATE TABLE IF NOT EXISTS motivation_collections (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '🔥',
  sort_order integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_motivation_collections_sort ON motivation_collections (sort_order);

ALTER TABLE achievement_stats ADD COLUMN total_motivation_sparks integer DEFAULT 0 NOT NULL;
ALTER TABLE achievement_stats ADD COLUMN motivation_open_streak integer DEFAULT 0 NOT NULL;
ALTER TABLE achievement_stats ADD COLUMN best_motivation_open_streak integer DEFAULT 0 NOT NULL;
ALTER TABLE achievement_stats ADD COLUMN total_motivation_opens integer DEFAULT 0 NOT NULL;
