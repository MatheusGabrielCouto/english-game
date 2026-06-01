-- M8: métricas §C (duelos + baralho)

CREATE TABLE IF NOT EXISTS learning_analytics (
  id integer PRIMARY KEY NOT NULL,
  duel_wins integer NOT NULL DEFAULT 0,
  duel_losses integer NOT NULL DEFAULT 0,
  duel_sessions integer NOT NULL DEFAULT 0,
  duel_flawless_wins integer NOT NULL DEFAULT 0,
  flash_reviews integer NOT NULL DEFAULT 0,
  flash_sessions integer NOT NULL DEFAULT 0,
  cards_saved_from_duel integer NOT NULL DEFAULT 0,
  weekly_boss_wins integer NOT NULL DEFAULT 0,
  updated_at text NOT NULL
);
