CREATE TABLE `loot_box_open_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`loot_box_id` integer NOT NULL,
	`box_rarity` text NOT NULL,
	`reward_type` text NOT NULL,
	`reward_amount` integer NOT NULL,
	`reward_label` text NOT NULL,
	`reward_rarity` text,
	`reward_item_key` text,
	`opened_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loot_box_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_received` integer DEFAULT 0 NOT NULL,
	`total_opened` integer DEFAULT 0 NOT NULL,
	`total_coins_from_boxes` integer DEFAULT 0 NOT NULL,
	`total_shields_from_boxes` integer DEFAULT 0 NOT NULL,
	`biggest_coin_reward` integer DEFAULT 0 NOT NULL,
	`opened_common` integer DEFAULT 0 NOT NULL,
	`opened_rare` integer DEFAULT 0 NOT NULL,
	`opened_epic` integer DEFAULT 0 NOT NULL,
	`opened_legendary` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `loot_box_analytics` (`id`, `total_received`, `total_opened`, `total_coins_from_boxes`, `total_shields_from_boxes`, `biggest_coin_reward`, `opened_common`, `opened_rare`, `opened_epic`, `opened_legendary`)
VALUES (1, 0, 0, 0, 0, 0, 0, 0, 0, 0);
