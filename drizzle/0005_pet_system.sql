CREATE TABLE `pets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stage` text NOT NULL,
	`mood` text NOT NULL,
	`experience` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `pets` (`stage`, `mood`, `experience`, `level`, `created_at`, `updated_at`)
VALUES ('egg', 'normal', 0, 1, datetime('now'), datetime('now'));
--> statement-breakpoint
CREATE TABLE `pet_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_level` integer DEFAULT 1 NOT NULL,
	`current_stage` text NOT NULL,
	`total_evolutions` integer DEFAULT 0 NOT NULL,
	`total_experience_gained` integer DEFAULT 0 NOT NULL,
	`positive_mood_days` integer DEFAULT 0 NOT NULL,
	`negative_mood_days` integer DEFAULT 0 NOT NULL,
	`last_mood_record_date` text
);
--> statement-breakpoint
INSERT INTO `pet_analytics` (`id`, `current_level`, `current_stage`, `total_evolutions`, `total_experience_gained`, `positive_mood_days`, `negative_mood_days`)
VALUES (1, 1, 'egg', 0, 0, 0, 0);
--> statement-breakpoint
CREATE TABLE `pet_stage_rewards_claimed` (
	`stage` text PRIMARY KEY NOT NULL,
	`claimed_at` text NOT NULL
);
