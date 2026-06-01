CREATE TABLE `study_days` (
	`study_date` text PRIMARY KEY NOT NULL,
	`recorded_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `player` ADD `total_study_days` integer DEFAULT 0 NOT NULL;
