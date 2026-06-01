ALTER TABLE `player` ADD `shields` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE `shield_usage_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`used_at` text NOT NULL,
	`missed_date` text NOT NULL,
	`streak_protected` integer NOT NULL,
	`shields_remaining` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shield_stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_earned` integer DEFAULT 0 NOT NULL,
	`total_consumed` integer DEFAULT 0 NOT NULL,
	`total_streaks_protected` integer DEFAULT 0 NOT NULL,
	`longest_protected_streak` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `shield_stats` (`id`, `total_earned`, `total_consumed`, `total_streaks_protected`, `longest_protected_streak`) VALUES (1, 0, 0, 0, 0);
--> statement-breakpoint
CREATE TABLE `shield_milestones_claimed` (
	`milestone_key` text PRIMARY KEY NOT NULL,
	`claimed_at` text NOT NULL
);
