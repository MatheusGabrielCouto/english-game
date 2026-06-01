CREATE TABLE `title_unlocks` (
	`title_key` text PRIMARY KEY NOT NULL,
	`unlocked_at` text NOT NULL,
	`level_at_unlock` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `title_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_title_key` text NOT NULL,
	`total_unlocked` integer DEFAULT 0 NOT NULL,
	`last_promotion_at` text
);
--> statement-breakpoint
INSERT INTO `title_analytics` (`id`, `current_title_key`, `total_unlocked`)
VALUES (1, 'local_developer', 0);
