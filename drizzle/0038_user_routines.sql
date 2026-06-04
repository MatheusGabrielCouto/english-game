-- Rotinas personalizadas (Habits & Routines) — independentes das missões do jogo

CREATE TABLE IF NOT EXISTS user_routines (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  frequency text NOT NULL,
  reminder_time text,
  weekdays_json text DEFAULT '[]' NOT NULL,
  expected_duration_min integer,
  custom_xp integer,
  custom_coins integer,
  template_key text,
  is_archived integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_routines_archived ON user_routines (is_archived);

CREATE TABLE IF NOT EXISTS routine_completions (
  id text PRIMARY KEY NOT NULL,
  routine_id text NOT NULL,
  period_key text NOT NULL,
  completed_at text NOT NULL,
  xp_awarded integer DEFAULT 0 NOT NULL,
  coins_awarded integer DEFAULT 0 NOT NULL,
  study_points_awarded integer DEFAULT 0 NOT NULL,
  UNIQUE (routine_id, period_key)
);

CREATE INDEX IF NOT EXISTS idx_routine_completions_routine ON routine_completions (routine_id);

CREATE TABLE IF NOT EXISTS routine_stats (
  routine_id text PRIMARY KEY NOT NULL,
  total_completed integer DEFAULT 0 NOT NULL,
  total_missed integer DEFAULT 0 NOT NULL,
  current_streak integer DEFAULT 0 NOT NULL,
  best_streak integer DEFAULT 0 NOT NULL,
  last_completed_period text,
  updated_at text NOT NULL
);

-- Analytics globais de rotinas (conquistas)
ALTER TABLE achievement_stats ADD COLUMN total_routines_completed integer DEFAULT 0 NOT NULL;
