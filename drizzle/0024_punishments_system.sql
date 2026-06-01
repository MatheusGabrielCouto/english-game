CREATE TABLE IF NOT EXISTS `punishment_state` (
  `id` integer PRIMARY KEY NOT NULL,
  `active_penalties_json` text DEFAULT '[]' NOT NULL,
  `recovery_streak_days` integer DEFAULT 0 NOT NULL,
  `last_app_open_at` text,
  `last_recovery_at` text,
  `pending_warning_json` text,
  `city_vibrancy` integer DEFAULT 100 NOT NULL,
  `updated_at` text NOT NULL
);

INSERT OR IGNORE INTO `punishment_state` (`id`, `active_penalties_json`, `recovery_streak_days`, `city_vibrancy`, `updated_at`)
VALUES (1, '[]', 0, 100, datetime('now'));

CREATE TABLE IF NOT EXISTS `punishment_history` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `trigger_type` text NOT NULL,
  `severity` text NOT NULL,
  `xp_decay_percent` integer DEFAULT 0 NOT NULL,
  `coin_decay_percent` integer DEFAULT 0 NOT NULL,
  `loot_luck_reduction` integer DEFAULT 0 NOT NULL,
  `contract_penalty` integer DEFAULT 0 NOT NULL,
  `pet_mood_override` text,
  `city_vibrancy` integer DEFAULT 100 NOT NULL,
  `applied_at` text NOT NULL,
  `recovered_at` text,
  `metadata_json` text
);

CREATE TABLE IF NOT EXISTS `punishment_analytics` (
  `id` integer PRIMARY KEY NOT NULL,
  `total_applied` integer DEFAULT 0 NOT NULL,
  `total_recovered` integer DEFAULT 0 NOT NULL,
  `total_warnings` integer DEFAULT 0 NOT NULL,
  `streak_failures` integer DEFAULT 0 NOT NULL,
  `contract_failures` integer DEFAULT 0 NOT NULL,
  `focus_failures` integer DEFAULT 0 NOT NULL,
  `inactivity_failures` integer DEFAULT 0 NOT NULL,
  `avg_recovery_days` real DEFAULT 0 NOT NULL,
  `last_applied_at` text,
  `last_recovered_at` text
);

INSERT OR IGNORE INTO `punishment_analytics` (`id`, `total_applied`, `total_recovered`, `total_warnings`)
VALUES (1, 0, 0, 0);
