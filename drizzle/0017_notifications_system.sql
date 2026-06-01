CREATE TABLE `notification_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`preferred_hour` integer DEFAULT 19 NOT NULL,
	`preferred_minute` integer DEFAULT 0 NOT NULL,
	`daily_reminder` integer DEFAULT 1 NOT NULL,
	`streak_reminder` integer DEFAULT 1 NOT NULL,
	`shield_warning` integer DEFAULT 1 NOT NULL,
	`pet_reminder` integer DEFAULT 1 NOT NULL,
	`contract_reminder` integer DEFAULT 1 NOT NULL,
	`achievement_progress` integer DEFAULT 1 NOT NULL,
	`city_progress` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `notification_settings` (
	`id`,
	`enabled`,
	`preferred_hour`,
	`preferred_minute`,
	`daily_reminder`,
	`streak_reminder`,
	`shield_warning`,
	`pet_reminder`,
	`contract_reminder`,
	`achievement_progress`,
	`city_progress`,
	`updated_at`
) VALUES (
	1,
	1,
	19,
	0,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	datetime('now')
);
--> statement-breakpoint
CREATE TABLE `notification_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`identifier` text NOT NULL,
	`scheduled_for` text,
	`delivered_at` text,
	`opened_at` text,
	`created_at` text NOT NULL
);
