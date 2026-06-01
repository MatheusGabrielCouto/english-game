-- M7: estado leve de integração (bônus arena, nudge pet) + stats de conquistas

CREATE TABLE IF NOT EXISTS learning_app_state (
  state_key text PRIMARY KEY NOT NULL,
  state_value text NOT NULL,
  updated_at text NOT NULL
);

ALTER TABLE achievement_stats ADD COLUMN total_duel_wins integer NOT NULL DEFAULT 0;
ALTER TABLE achievement_stats ADD COLUMN total_flash_reviews integer NOT NULL DEFAULT 0;
