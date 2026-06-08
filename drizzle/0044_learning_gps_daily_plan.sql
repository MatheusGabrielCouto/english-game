-- Fase 23: Learning GPS — plano diário e progresso de blocos

CREATE TABLE IF NOT EXISTS learning_daily_plans (
  date_key text PRIMARY KEY NOT NULL,
  difficulty text NOT NULL,
  block_progress_json text NOT NULL DEFAULT '{}',
  updated_at text NOT NULL
);
