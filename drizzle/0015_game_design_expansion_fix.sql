ALTER TABLE `app_settings` ADD COLUMN `avatar_frame` text DEFAULT 'default' NOT NULL;
--> statement-breakpoint
ALTER TABLE `app_settings` ADD COLUMN `avatar_badge` text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `player_rpg` (
  `id` integer PRIMARY KEY NOT NULL,
  `intelligence` integer DEFAULT 1 NOT NULL,
  `discipline` integer DEFAULT 1 NOT NULL,
  `communication` integer DEFAULT 1 NOT NULL,
  `confidence` integer DEFAULT 1 NOT NULL,
  `fluency` integer DEFAULT 1 NOT NULL,
  `unlocked_perks_json` text DEFAULT '[]' NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `daily_missions` ADD COLUMN `category` text;
--> statement-breakpoint
ALTER TABLE `daily_missions` ADD COLUMN `difficulty` text;
--> statement-breakpoint
ALTER TABLE `daily_missions` ADD COLUMN `template_key` text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `epic_mission_progress` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `mission_type` text NOT NULL,
  `target_value` integer NOT NULL,
  `current_value` integer DEFAULT 0 NOT NULL,
  `xp_reward` integer NOT NULL,
  `coin_reward` integer NOT NULL,
  `difficulty` text NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `started_at` text NOT NULL,
  `completed_at` text
);
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `species_key` text DEFAULT 'codeowl' NOT NULL;
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `energy` integer DEFAULT 100 NOT NULL;
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `hunger` integer DEFAULT 100 NOT NULL;
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `happiness` integer DEFAULT 100 NOT NULL;
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `motivation` integer DEFAULT 100 NOT NULL;
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `affinity` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `is_incubating` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `pets` ADD COLUMN `hatch_at` text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pet_collection` (
  `species_key` text PRIMARY KEY NOT NULL,
  `discovered_at` text NOT NULL,
  `times_owned` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `active_boosters` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `booster_key` text NOT NULL,
  `multiplier` real NOT NULL,
  `expires_at` text NOT NULL,
  `source` text NOT NULL
);
