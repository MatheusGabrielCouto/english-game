ALTER TABLE `city_poi_missions` ADD COLUMN `event_key` text;
--> statement-breakpoint
CREATE TABLE `city_event_state` (
	`event_key` text PRIMARY KEY NOT NULL,
	`spirit_progress` integer DEFAULT 0 NOT NULL,
	`vocab_words_learned` integer DEFAULT 0 NOT NULL,
	`intro_seen` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`started_at` text,
	`updated_at` text NOT NULL
);
