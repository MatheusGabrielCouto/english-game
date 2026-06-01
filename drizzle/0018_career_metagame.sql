CREATE TABLE `career_progress` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_role_key` text DEFAULT 'student' NOT NULL,
	`current_company_key` text DEFAULT 'startup_local' NOT NULL,
	`english_score` integer DEFAULT 0 NOT NULL,
	`completed_interviews_json` text DEFAULT '[]' NOT NULL,
	`unlocked_offers_json` text DEFAULT '[]' NOT NULL,
	`dream_progress_json` text DEFAULT '{}' NOT NULL,
	`promotions_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `career_progress` (
	`id`,
	`current_role_key`,
	`current_company_key`,
	`english_score`,
	`completed_interviews_json`,
	`unlocked_offers_json`,
	`dream_progress_json`,
	`promotions_count`,
	`updated_at`
) VALUES (
	1,
	'student',
	'startup_local',
	0,
	'[]',
	'[]',
	'{}',
	0,
	datetime('now')
);
--> statement-breakpoint
CREATE TABLE `career_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_type` text NOT NULL,
	`event_key` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `metagame_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`prestige_level` integer DEFAULT 0 NOT NULL,
	`season_key` text NOT NULL,
	`season_points` integer DEFAULT 0 NOT NULL,
	`annual_progress_json` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `metagame_state` (
	`id`,
	`prestige_level`,
	`season_key`,
	`season_points`,
	`annual_progress_json`,
	`updated_at`
) VALUES (
	1,
	0,
	'2026-01',
	0,
	'{}',
	datetime('now')
);
--> statement-breakpoint
CREATE TABLE `legacy_milestones` (
	`milestone_key` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`occurred_at` text NOT NULL,
	`recorded_at` text NOT NULL
);
