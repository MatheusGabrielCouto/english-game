-- Fase 24: progresso por unidade do currículo (Survivor A1 piloto)

CREATE TABLE IF NOT EXISTS learning_unit_progress (
  unit_key text PRIMARY KEY NOT NULL,
  world_key text NOT NULL,
  status text NOT NULL DEFAULT 'locked',
  practice_progress integer NOT NULL DEFAULT 0,
  completed_at text,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_unit_progress_world ON learning_unit_progress (world_key);
