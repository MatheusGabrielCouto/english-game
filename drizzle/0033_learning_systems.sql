-- M0: Baralho Vivo + Duelos de Inglês + ledger de competência

CREATE TABLE IF NOT EXISTS flash_decks (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  cover_emoji text,
  sort_order integer DEFAULT 0 NOT NULL,
  new_per_day integer DEFAULT 10 NOT NULL,
  review_cap integer DEFAULT 80 NOT NULL,
  created_at text NOT NULL,
  archived_at text
);

CREATE TABLE IF NOT EXISTS flash_cards (
  id text PRIMARY KEY NOT NULL,
  deck_id text NOT NULL,
  lemma text,
  front text NOT NULL,
  back text NOT NULL,
  example_sentence text,
  audio_uri text,
  image_uri text,
  tags_json text DEFAULT '[]' NOT NULL,
  source text NOT NULL,
  ease_factor real DEFAULT 2.5 NOT NULL,
  interval_days integer DEFAULT 0 NOT NULL,
  repetitions integer DEFAULT 0 NOT NULL,
  lapse_count integer DEFAULT 0 NOT NULL,
  due_at text NOT NULL,
  state text NOT NULL,
  last_reviewed_at text,
  created_at text NOT NULL,
  suspended integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flash_cards_due ON flash_cards (due_at, suspended);
CREATE INDEX IF NOT EXISTS idx_flash_cards_deck_state ON flash_cards (deck_id, state);

CREATE TABLE IF NOT EXISTS flash_review_log (
  id text PRIMARY KEY NOT NULL,
  card_id text NOT NULL,
  rating text NOT NULL,
  previous_interval integer,
  new_interval integer,
  reviewed_at text NOT NULL,
  session_id text,
  duration_ms integer
);

CREATE TABLE IF NOT EXISTS flash_study_sessions (
  id text PRIMARY KEY NOT NULL,
  deck_id text,
  mode text NOT NULL,
  cards_reviewed integer NOT NULL,
  started_at text NOT NULL,
  ended_at text
);

CREATE TABLE IF NOT EXISTS duel_player_profile (
  id integer PRIMARY KEY NOT NULL,
  current_patent text NOT NULL,
  patent_xp integer DEFAULT 0 NOT NULL,
  highest_patent text NOT NULL,
  stamina integer DEFAULT 5 NOT NULL,
  stamina_updated_at text NOT NULL,
  focus_charges integer DEFAULT 1 NOT NULL,
  daily_duel_count integer DEFAULT 0 NOT NULL,
  daily_reset_date text NOT NULL
);

CREATE TABLE IF NOT EXISTS duel_sessions (
  id text PRIMARY KEY NOT NULL,
  enemy_key text NOT NULL,
  arena_key text NOT NULL,
  patent_at_start text NOT NULL,
  player_hp integer NOT NULL,
  enemy_hp integer NOT NULL,
  combo_streak integer DEFAULT 0 NOT NULL,
  status text NOT NULL,
  started_at text NOT NULL,
  ended_at text
);

CREATE TABLE IF NOT EXISTS duel_session_questions (
  id text PRIMARY KEY NOT NULL,
  session_id text NOT NULL,
  sort_order integer NOT NULL,
  question_type text NOT NULL,
  lemma text,
  prompt_json text NOT NULL,
  answered_index integer,
  is_correct integer,
  response_ms integer,
  damage_dealt integer
);

CREATE INDEX IF NOT EXISTS idx_duel_session_questions_session ON duel_session_questions (session_id);

CREATE TABLE IF NOT EXISTS lemma_competence (
  lemma text PRIMARY KEY NOT NULL,
  recognition_score real DEFAULT 0 NOT NULL,
  grammar_score real DEFAULT 0 NOT NULL,
  retention_score real DEFAULT 0 NOT NULL,
  transfer_score real DEFAULT 0 NOT NULL,
  weakness_score real DEFAULT 0.5 NOT NULL,
  times_seen integer DEFAULT 0 NOT NULL,
  times_correct integer DEFAULT 0 NOT NULL,
  last_seen_at text,
  last_source text,
  updated_at text NOT NULL
);

-- Seeds mínimos (idempotentes)
INSERT OR IGNORE INTO flash_decks (
  id,
  name,
  description,
  cover_emoji,
  sort_order,
  new_per_day,
  review_cap,
  created_at
) VALUES (
  'deck_default',
  'Minhas palavras',
  'Palavras que você quer lembrar',
  '📒',
  0,
  10,
  80,
  datetime('now')
);

INSERT OR IGNORE INTO duel_player_profile (
  id,
  current_patent,
  patent_xp,
  highest_patent,
  stamina,
  stamina_updated_at,
  focus_charges,
  daily_duel_count,
  daily_reset_date
) VALUES (
  1,
  'tourist',
  0,
  'tourist',
  5,
  datetime('now'),
  1,
  0,
  date('now')
);
