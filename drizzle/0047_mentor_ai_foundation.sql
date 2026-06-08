CREATE TABLE IF NOT EXISTS `mentor_memory` (
  `key` text PRIMARY KEY NOT NULL,
  `value_json` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `mentor_chat_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `mode` text NOT NULL,
  `title` text NOT NULL,
  `messages_json` text NOT NULL DEFAULT '[]',
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `mentor_error_log` (
  `id` text PRIMARY KEY NOT NULL,
  `category` text NOT NULL,
  `original` text NOT NULL,
  `corrected` text NOT NULL,
  `occurred_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_mentor_chat_sessions_updated` ON `mentor_chat_sessions` (`updated_at` DESC);
CREATE INDEX IF NOT EXISTS `idx_mentor_error_log_occurred` ON `mentor_error_log` (`occurred_at` DESC);
