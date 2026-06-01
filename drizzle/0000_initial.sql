CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`has_onboarded` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_missions` (
	`id` text NOT NULL,
	`missions_date` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`xp_reward` integer NOT NULL,
	`coin_reward` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`id`, `missions_date`)
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`level` integer NOT NULL,
	`xp` integer NOT NULL,
	`coins` integer NOT NULL,
	`title` text NOT NULL,
	`created_at` text NOT NULL,
	`last_study_date` text,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`best_streak` integer DEFAULT 0 NOT NULL
);
