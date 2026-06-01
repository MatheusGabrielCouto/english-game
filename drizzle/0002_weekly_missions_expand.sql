ALTER TABLE `app_settings` ADD `current_week_start` text;
--> statement-breakpoint
CREATE TABLE `weekly_missions_new` (
	`id` text NOT NULL,
	`week_start_date` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`mission_type` text NOT NULL,
	`target_value` integer NOT NULL,
	`current_value` integer DEFAULT 0 NOT NULL,
	`xp_reward` integer NOT NULL,
	`coin_reward` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`claimed` integer DEFAULT false NOT NULL,
	`week_end_date` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`id`, `week_start_date`)
);
--> statement-breakpoint
INSERT INTO `weekly_missions_new` (
	`id`,
	`week_start_date`,
	`title`,
	`description`,
	`mission_type`,
	`target_value`,
	`current_value`,
	`xp_reward`,
	`coin_reward`,
	`completed`,
	`claimed`,
	`week_end_date`,
	`created_at`
)
SELECT
	`id`,
	date('now', 'weekday 1', '-7 days'),
	`title`,
	'',
	'STUDY_DAYS',
	`target`,
	`progress`,
	`xp_reward`,
	`coin_reward`,
	`completed`,
	0,
	date('now', 'weekday 0'),
	datetime('now')
FROM `weekly_missions`;
--> statement-breakpoint
DROP TABLE `weekly_missions`;
--> statement-breakpoint
ALTER TABLE `weekly_missions_new` RENAME TO `weekly_missions`;
--> statement-breakpoint
CREATE TABLE `weekly_missions_history` (
	`id` text NOT NULL,
	`week_start_date` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`mission_type` text NOT NULL,
	`target_value` integer NOT NULL,
	`current_value` integer NOT NULL,
	`xp_reward` integer NOT NULL,
	`coin_reward` integer NOT NULL,
	`completed` integer NOT NULL,
	`claimed` integer NOT NULL,
	`week_end_date` text NOT NULL,
	`created_at` text NOT NULL,
	`archived_at` text NOT NULL
);
