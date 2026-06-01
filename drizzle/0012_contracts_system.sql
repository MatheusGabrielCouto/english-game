CREATE TABLE `contract_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contract_key` text NOT NULL,
	`status` text NOT NULL,
	`target_days` integer NOT NULL,
	`progress_days` integer NOT NULL,
	`stake_amount` integer NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`last_progress_at` text
);
--> statement-breakpoint
CREATE TABLE `contract_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_accepted` integer DEFAULT 0 NOT NULL,
	`total_completed` integer DEFAULT 0 NOT NULL,
	`total_failed` integer DEFAULT 0 NOT NULL,
	`total_coins_staked` integer DEFAULT 0 NOT NULL,
	`total_coins_won` integer DEFAULT 0 NOT NULL,
	`total_coins_lost` integer DEFAULT 0 NOT NULL,
	`total_shields_granted` integer DEFAULT 0 NOT NULL,
	`total_loot_boxes_granted` integer DEFAULT 0 NOT NULL,
	`largest_contract_completed_key` text,
	`last_contract_at` text
);
--> statement-breakpoint
INSERT INTO `contract_analytics` (`id`, `total_accepted`, `total_completed`, `total_failed`, `total_coins_staked`, `total_coins_won`, `total_coins_lost`, `total_shields_granted`, `total_loot_boxes_granted`)
VALUES (1, 0, 0, 0, 0, 0, 0, 0, 0);
