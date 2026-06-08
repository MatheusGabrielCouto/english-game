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

export const reconcileMotivationSparkSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'motivation_sparks')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS motivation_sparks (
        id text PRIMARY KEY NOT NULL,
        title text NOT NULL,
        body text,
        content_kind text NOT NULL DEFAULT 'text',
        images_json text NOT NULL DEFAULT '[]',
        audio_uri text,
        audio_duration_ms integer,
        audio_transcript text,
        links_json text NOT NULL DEFAULT '[]',
        collection_id text,
        tags_json text NOT NULL DEFAULT '[]',
        importance text NOT NULL DEFAULT 'medium',
        is_favorite integer DEFAULT 0 NOT NULL,
        is_pinned integer DEFAULT 0 NOT NULL,
        is_archived integer DEFAULT 0 NOT NULL,
        rotation_weight integer DEFAULT 1 NOT NULL,
        last_shown_at text,
        show_count integer DEFAULT 0 NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'motivation_daily_picks')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS motivation_daily_picks (
        date_key text PRIMARY KEY NOT NULL,
        spark_id text NOT NULL,
        notified_at text,
        evening_notified_at text,
        opened_at text
      )
    `);
  }

  if (
    tableExists(sqlite, 'motivation_daily_picks') &&
    !columnExists(sqlite, 'motivation_daily_picks', 'evening_notified_at')
  ) {
    sqlite.execSync(`ALTER TABLE motivation_daily_picks ADD COLUMN evening_notified_at text`);
  }

  if (!tableExists(sqlite, 'motivation_settings')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS motivation_settings (
        id integer PRIMARY KEY NOT NULL,
        enabled integer DEFAULT 1 NOT NULL,
        daily_notification integer DEFAULT 1 NOT NULL,
        evening_notification integer DEFAULT 0 NOT NULL,
        preferred_hour integer DEFAULT 7 NOT NULL,
        preferred_minute integer DEFAULT 0 NOT NULL,
        evening_hour integer DEFAULT 20 NOT NULL,
        evening_minute integer DEFAULT 0 NOT NULL,
        avoid_repeat_days integer DEFAULT 7 NOT NULL,
        show_on_home integer DEFAULT 1 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO motivation_settings (
        id, enabled, daily_notification, evening_notification,
        preferred_hour, preferred_minute, evening_hour, evening_minute,
        avoid_repeat_days, show_on_home, updated_at
      ) VALUES (1, 1, 1, 0, 7, 0, 20, 0, 7, 1, datetime('now'))
    `);
  }

  if (
    tableExists(sqlite, 'notification_settings') &&
    !columnExists(sqlite, 'notification_settings', 'motivation_spark')
  ) {
    sqlite.execSync(
      `ALTER TABLE notification_settings ADD COLUMN motivation_spark integer DEFAULT 1 NOT NULL`,
    );
  }

  if (!tableExists(sqlite, 'motivation_collections')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS motivation_collections (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        emoji text NOT NULL DEFAULT '🔥',
        sort_order integer DEFAULT 0 NOT NULL,
        created_at text NOT NULL
      )
    `);
  }

  if (tableExists(sqlite, 'achievement_stats')) {
    if (!columnExists(sqlite, 'achievement_stats', 'total_motivation_sparks')) {
      sqlite.execSync(
        `ALTER TABLE achievement_stats ADD COLUMN total_motivation_sparks integer DEFAULT 0 NOT NULL`,
      );
    }
    if (!columnExists(sqlite, 'achievement_stats', 'motivation_open_streak')) {
      sqlite.execSync(
        `ALTER TABLE achievement_stats ADD COLUMN motivation_open_streak integer DEFAULT 0 NOT NULL`,
      );
    }
    if (!columnExists(sqlite, 'achievement_stats', 'best_motivation_open_streak')) {
      sqlite.execSync(
        `ALTER TABLE achievement_stats ADD COLUMN best_motivation_open_streak integer DEFAULT 0 NOT NULL`,
      );
    }
    if (!columnExists(sqlite, 'achievement_stats', 'total_motivation_opens')) {
      sqlite.execSync(
        `ALTER TABLE achievement_stats ADD COLUMN total_motivation_opens integer DEFAULT 0 NOT NULL`,
      );
    }
  }

  ensureMigrationApplied(sqlite, '0041_motivation_spark');
  ensureMigrationApplied(sqlite, '0042_motivation_v11');
};
