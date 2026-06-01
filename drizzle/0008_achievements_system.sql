CREATE TABLE `achievement_unlocks` (
	`achievement_key` text PRIMARY KEY NOT NULL,
	`unlocked_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `achievement_stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_missions_completed` integer DEFAULT 0 NOT NULL,
	`total_xp_earned` integer DEFAULT 0 NOT NULL,
	`total_loot_boxes_opened` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `achievement_stats` (`id`, `total_missions_completed`, `total_xp_earned`, `total_loot_boxes_opened`)
VALUES (1, 0, 0, 0);
--> statement-breakpoint
CREATE TABLE `achievement_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_unlocked` integer DEFAULT 0 NOT NULL,
	`total_coins_granted` integer DEFAULT 0 NOT NULL,
	`total_shields_granted` integer DEFAULT 0 NOT NULL,
	`total_loot_boxes_granted` integer DEFAULT 0 NOT NULL,
	`last_unlock_at` text
);
--> statement-breakpoint
INSERT INTO `achievement_analytics` (`id`, `total_unlocked`, `total_coins_granted`, `total_shields_granted`, `total_loot_boxes_granted`)
VALUES (1, 0, 0, 0, 0);
