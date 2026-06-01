ALTER TABLE `city_map_state` ADD `active_rumor_key` text;
--> statement-breakpoint
ALTER TABLE `city_map_state` ADD `rumor_updated_at` text;
--> statement-breakpoint
CREATE TABLE `city_poi_visits` (
	`poi_key` text NOT NULL,
	`visit_date` text NOT NULL,
	`pet_visit_bonus` integer DEFAULT false NOT NULL,
	`visited_at` text NOT NULL,
	PRIMARY KEY(`poi_key`, `visit_date`)
);
