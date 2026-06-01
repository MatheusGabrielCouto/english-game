ALTER TABLE `city_pois` ADD COLUMN `npc_trust` integer DEFAULT 50 NOT NULL;
--> statement-breakpoint
ALTER TABLE `city_poi_missions` ADD COLUMN `chain_key` text;
--> statement-breakpoint
ALTER TABLE `city_poi_missions` ADD COLUMN `chain_step` integer;
--> statement-breakpoint
CREATE TABLE `city_poi_chain_progress` (
	`poi_key` text NOT NULL,
	`chain_key` text NOT NULL,
	`current_step` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`poi_key`, `chain_key`)
);
