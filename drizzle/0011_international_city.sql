CREATE TABLE `city_building_unlocks` (
	`building_key` text PRIMARY KEY NOT NULL,
	`unlocked_at` text NOT NULL,
	`level_at_unlock` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `city_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_building_key` text NOT NULL,
	`total_unlocked` integer DEFAULT 0 NOT NULL,
	`last_unlock_at` text
);
--> statement-breakpoint
INSERT INTO `city_analytics` (`id`, `current_building_key`, `total_unlocked`)
VALUES (1, 'house', 0);
