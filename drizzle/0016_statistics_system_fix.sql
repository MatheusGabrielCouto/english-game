CREATE TABLE IF NOT EXISTS `statistics_milestones` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `category` text NOT NULL,
  `milestone_key` text NOT NULL,
  `label` text NOT NULL,
  `value` integer,
  `metadata_json` text,
  `occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `statistics_milestones_key_idx` ON `statistics_milestones` (`milestone_key`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `statistics_milestones_occurred_at_idx` ON `statistics_milestones` (`occurred_at`);
