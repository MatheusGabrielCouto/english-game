CREATE TABLE IF NOT EXISTS `learning_monthly_reports` (
  `month_key` text PRIMARY KEY NOT NULL,
  `generated_at` text NOT NULL,
  `report_json` text NOT NULL,
  `updated_at` text NOT NULL
);
