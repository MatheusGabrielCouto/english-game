CREATE TABLE `inventory_loot_boxes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rarity` text NOT NULL,
	`source` text NOT NULL,
	`acquired_at` text NOT NULL,
	`opened` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_special_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_key` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`source` text NOT NULL,
	`acquired_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_acquisition_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`item_key` text NOT NULL,
	`quantity` integer NOT NULL,
	`message` text NOT NULL,
	`source` text NOT NULL,
	`acquired_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_items_acquired` integer DEFAULT 0 NOT NULL,
	`total_shields_received` integer DEFAULT 0 NOT NULL,
	`total_loot_boxes_received` integer DEFAULT 0 NOT NULL,
	`total_special_items_received` integer DEFAULT 0 NOT NULL,
	`last_updated_at` text
);
--> statement-breakpoint
INSERT INTO `inventory_analytics` (`id`, `total_items_acquired`, `total_shields_received`, `total_loot_boxes_received`, `total_special_items_received`)
VALUES (1, 0, 0, 0, 0);
