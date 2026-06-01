CREATE TABLE `city_districts` (
	`district_key` text PRIMARY KEY NOT NULL,
	`unlocked_at` text,
	`unlock_reason` text
);
--> statement-breakpoint
CREATE TABLE `city_pois` (
	`poi_key` text PRIMARY KEY NOT NULL,
	`district_key` text NOT NULL,
	`category` text NOT NULL,
	`local_level` integer DEFAULT 1 NOT NULL,
	`local_xp` integer DEFAULT 0 NOT NULL,
	`position_x` real NOT NULL,
	`position_y` real NOT NULL,
	`unlocked_at` text,
	`visual_stage` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `city_map_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`city_name` text NOT NULL,
	`city_vitality` integer DEFAULT 100 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `city_map_state` (`id`, `city_name`, `city_vitality`, `updated_at`)
VALUES (1, 'Minha Cidade', 100, datetime('now'));
