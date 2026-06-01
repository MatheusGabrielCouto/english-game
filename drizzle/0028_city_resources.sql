CREATE TABLE `city_resources` (
	`resource_type` text PRIMARY KEY NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `city_poi_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`poi_key` text NOT NULL,
	`project_key` text NOT NULL,
	`week_start_date` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`resource_type` text NOT NULL,
	`target_total` integer NOT NULL,
	`delivery_chunk` integer NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`local_xp_on_complete` integer NOT NULL,
	`vitality_on_complete` integer NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `city_poi_projects_poi_week_idx` ON `city_poi_projects` (`poi_key`, `week_start_date`);
--> statement-breakpoint
CREATE TABLE `city_resource_delivery_caps` (
	`resource_type` text NOT NULL,
	`delivery_date` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`resource_type`, `delivery_date`)
);
