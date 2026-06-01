CREATE TABLE `study_points` (
	`id` integer PRIMARY KEY NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`lifetime_earned` integer DEFAULT 0 NOT NULL,
	`lifetime_spent` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `study_points` (
	`id`,
	`balance`,
	`lifetime_earned`,
	`lifetime_spent`,
	`updated_at`
) VALUES (
	1,
	0,
	0,
	0,
	datetime('now')
);
--> statement-breakpoint
CREATE TABLE `study_points_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collection_book` (
	`item_key` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`rarity` text NOT NULL,
	`discovered_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `farm_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_type` text NOT NULL,
	`amount` integer NOT NULL,
	`study_points_earned` integer NOT NULL,
	`coins_earned` integer NOT NULL,
	`recorded_at` text NOT NULL
);
