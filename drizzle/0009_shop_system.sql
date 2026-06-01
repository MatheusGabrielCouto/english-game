CREATE TABLE `shop_purchase_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_key` text NOT NULL,
	`product_name` text NOT NULL,
	`category` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_paid` integer NOT NULL,
	`purchased_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_coins_spent` integer DEFAULT 0 NOT NULL,
	`total_purchases` integer DEFAULT 0 NOT NULL,
	`total_items_acquired` integer DEFAULT 0 NOT NULL,
	`shields_purchased` integer DEFAULT 0 NOT NULL,
	`loot_boxes_purchased` integer DEFAULT 0 NOT NULL,
	`last_purchase_at` text
);
--> statement-breakpoint
INSERT INTO `shop_analytics` (`id`, `total_coins_spent`, `total_purchases`, `total_items_acquired`, `shields_purchased`, `loot_boxes_purchased`)
VALUES (1, 0, 0, 0, 0, 0);
--> statement-breakpoint
CREATE TABLE `shop_product_stats` (
	`product_key` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`purchase_count` integer DEFAULT 0 NOT NULL,
	`coins_spent` integer DEFAULT 0 NOT NULL
);
