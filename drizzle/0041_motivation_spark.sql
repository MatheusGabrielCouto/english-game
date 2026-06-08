-- Chama Interior — faíscas motivacionais multimídia

CREATE TABLE IF NOT EXISTS motivation_sparks (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  body text,
  content_kind text NOT NULL DEFAULT 'text',
  images_json text NOT NULL DEFAULT '[]',
  audio_uri text,
  audio_duration_ms integer,
  audio_transcript text,
  links_json text NOT NULL DEFAULT '[]',
  collection_id text,
  tags_json text NOT NULL DEFAULT '[]',
  importance text NOT NULL DEFAULT 'medium',
  is_favorite integer DEFAULT 0 NOT NULL,
  is_pinned integer DEFAULT 0 NOT NULL,
  is_archived integer DEFAULT 0 NOT NULL,
  rotation_weight integer DEFAULT 1 NOT NULL,
  last_shown_at text,
  show_count integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_motivation_sparks_archived ON motivation_sparks (is_archived);
CREATE INDEX IF NOT EXISTS idx_motivation_sparks_pinned ON motivation_sparks (is_pinned);
CREATE INDEX IF NOT EXISTS idx_motivation_sparks_favorite ON motivation_sparks (is_favorite);
CREATE INDEX IF NOT EXISTS idx_motivation_sparks_created ON motivation_sparks (created_at);

CREATE TABLE IF NOT EXISTS motivation_daily_picks (
  date_key text PRIMARY KEY NOT NULL,
  spark_id text NOT NULL,
  notified_at text,
  opened_at text
);

CREATE INDEX IF NOT EXISTS idx_motivation_daily_picks_spark ON motivation_daily_picks (spark_id);

CREATE TABLE IF NOT EXISTS motivation_settings (
  id integer PRIMARY KEY NOT NULL,
  enabled integer DEFAULT 1 NOT NULL,
  daily_notification integer DEFAULT 1 NOT NULL,
  evening_notification integer DEFAULT 0 NOT NULL,
  preferred_hour integer DEFAULT 7 NOT NULL,
  preferred_minute integer DEFAULT 0 NOT NULL,
  evening_hour integer DEFAULT 20 NOT NULL,
  evening_minute integer DEFAULT 0 NOT NULL,
  avoid_repeat_days integer DEFAULT 7 NOT NULL,
  show_on_home integer DEFAULT 1 NOT NULL,
  updated_at text NOT NULL
);

INSERT OR IGNORE INTO motivation_settings (
  id,
  enabled,
  daily_notification,
  evening_notification,
  preferred_hour,
  preferred_minute,
  evening_hour,
  evening_minute,
  avoid_repeat_days,
  show_on_home,
  updated_at
) VALUES (1, 1, 1, 0, 7, 0, 20, 0, 7, 1, datetime('now'));

ALTER TABLE notification_settings ADD COLUMN motivation_spark integer DEFAULT 1 NOT NULL;
