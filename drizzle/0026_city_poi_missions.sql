CREATE TABLE `city_poi_missions` (
	`id` text PRIMARY KEY NOT NULL,
	`poi_key` text NOT NULL,
	`mission_date` text NOT NULL,
	`template_key` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`mission_type` text NOT NULL,
	`target_value` integer NOT NULL,
	`current_value` integer DEFAULT 0 NOT NULL,
	`xp_reward` integer NOT NULL,
	`coin_reward` integer NOT NULL,
	`local_xp_reward` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`claimed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `city_poi_missions_date_idx` ON `city_poi_missions` (`mission_date`);
--> statement-breakpoint
CREATE INDEX `city_poi_missions_poi_date_idx` ON `city_poi_missions` (`poi_key`, `mission_date`);
