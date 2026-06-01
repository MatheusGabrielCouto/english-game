import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureMigrationApplied } from './resilient-migrator';

type TableInfoRow = {
  name: string;
};

const getColumnNames = (sqlite: SQLiteDatabase, table: string): Set<string> => {
  const rows = sqlite.getAllSync(`PRAGMA table_info(${table})`) as TableInfoRow[];
  return new Set(rows.map((row) => row.name));
};

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

const addColumnIfMissing = (
  sqlite: SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
): void => {
  const columns = getColumnNames(sqlite, table);
  if (columns.has(column)) return;

  sqlite.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};

const ensureWeeklyMissionsHistory = (sqlite: SQLiteDatabase): void => {
  if (tableExists(sqlite, 'weekly_missions_history')) return;

  sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS weekly_missions_history (
      id text NOT NULL,
      week_start_date text NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      mission_type text NOT NULL,
      target_value integer NOT NULL,
      current_value integer NOT NULL,
      xp_reward integer NOT NULL,
      coin_reward integer NOT NULL,
      completed integer NOT NULL,
      claimed integer NOT NULL,
      week_end_date text NOT NULL,
      created_at text NOT NULL,
      archived_at text NOT NULL
    )
  `);
};

/**
 * Repairs databases where weekly_missions already uses the expanded schema
 * but migration 0002 was never recorded (re-run would SELECT legacy \`target\`).
 */
export const reconcileWeeklyMissionsSchema = (sqlite: SQLiteDatabase): void => {
  if (tableExists(sqlite, 'weekly_missions_new')) {
    sqlite.execSync('DROP TABLE IF EXISTS weekly_missions_new');
  }

  if (!tableExists(sqlite, 'weekly_missions')) return;

  const columns = getColumnNames(sqlite, 'weekly_missions');
  if (!columns.has('target_value')) return;

  if (tableExists(sqlite, 'app_settings')) {
    addColumnIfMissing(sqlite, 'app_settings', 'current_week_start', 'text');
  }

  ensureWeeklyMissionsHistory(sqlite);
  ensureMigrationApplied(sqlite, '0001_weekly_missions');
  ensureMigrationApplied(sqlite, '0002_weekly_missions_expand');
};
