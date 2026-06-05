import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureMigrationApplied } from './resilient-migrator';

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

const columnExists = (sqlite: SQLiteDatabase, table: string, column: string): boolean => {
  const rows = sqlite.getAllSync(`PRAGMA table_info(${table})`) as { name: string }[];
  return rows.some((row) => row.name === column);
};

export const reconcileShopOffersSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'shop_daily_offers')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS shop_daily_offers (
        date_key text PRIMARY KEY NOT NULL,
        has_offer integer NOT NULL DEFAULT 0,
        catalog_offer_id text,
        product_key text,
        discount_percent integer,
        offer_price integer,
        original_price integer,
        purchased integer NOT NULL DEFAULT 0,
        created_at text NOT NULL
      )
    `);
  }

  if (tableExists(sqlite, 'notification_settings')) {
    if (!columnExists(sqlite, 'notification_settings', 'shop_offer_reminder')) {
      sqlite.execSync(
        `ALTER TABLE notification_settings ADD COLUMN shop_offer_reminder integer DEFAULT 1 NOT NULL`,
      );
    }
  }

  if (!tableExists(sqlite, 'shop_stock_slots')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS shop_stock_slots (
        storage_key text PRIMARY KEY NOT NULL,
        period_type text NOT NULL,
        period_key text NOT NULL,
        shop_kind text NOT NULL,
        catalog_stock_id text NOT NULL,
        product_key text NOT NULL,
        max_stock integer NOT NULL,
        stock_remaining integer NOT NULL,
        created_at text NOT NULL
      )
    `);
  }

  ensureMigrationApplied(sqlite, 'shop_daily_offers_v1');
  ensureMigrationApplied(sqlite, 'shop_stock_slots_v1');
};
