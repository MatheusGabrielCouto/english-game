CREATE TABLE `weekly_missions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`target` integer NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`xp_reward` integer NOT NULL,
	`coin_reward` integer NOT NULL
);
