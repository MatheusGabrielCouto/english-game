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

/** Ensures user routines tables exist when migration 0038 was skipped. */
export const reconcileUserRoutinesSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'user_routines')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS user_routines (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        description text,
        category text NOT NULL,
        frequency text NOT NULL,
        reminder_time text,
        weekdays_json text DEFAULT '[]' NOT NULL,
        expected_duration_min integer,
        custom_xp integer,
        custom_coins integer,
        template_key text,
        is_archived integer DEFAULT 0 NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'routine_completions')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS routine_completions (
        id text PRIMARY KEY NOT NULL,
        routine_id text NOT NULL,
        period_key text NOT NULL,
        completed_at text NOT NULL,
        xp_awarded integer DEFAULT 0 NOT NULL,
        coins_awarded integer DEFAULT 0 NOT NULL,
        study_points_awarded integer DEFAULT 0 NOT NULL,
        UNIQUE (routine_id, period_key)
      )
    `);
  }

  if (!tableExists(sqlite, 'routine_stats')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS routine_stats (
        routine_id text PRIMARY KEY NOT NULL,
        total_completed integer DEFAULT 0 NOT NULL,
        total_missed integer DEFAULT 0 NOT NULL,
        current_streak integer DEFAULT 0 NOT NULL,
        best_streak integer DEFAULT 0 NOT NULL,
        last_completed_period text,
        updated_at text NOT NULL
      )
    `);
  }

  if (
    tableExists(sqlite, 'achievement_stats') &&
    !columnExists(sqlite, 'achievement_stats', 'total_routines_completed')
  ) {
    sqlite.execSync(
      `ALTER TABLE achievement_stats ADD COLUMN total_routines_completed integer DEFAULT 0 NOT NULL`,
    );
  }

  ensureMigrationApplied(sqlite, '0038_user_routines');
};
