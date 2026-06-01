import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureMigrationApplied } from './resilient-migrator';

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

/**
 * Repairs databases where migration 0023 ran as a single exec and only created
 * the first table (focus_settings). Without this, Focus Mode init throws on
 * seedDefaultBlockedApps and stays in infinite loading.
 */
export const reconcileFocusModeSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'focus_settings')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS focus_settings (
        id integer PRIMARY KEY NOT NULL,
        enabled integer DEFAULT 1 NOT NULL,
        default_duration_minutes integer DEFAULT 30 NOT NULL,
        hardcore_mode integer DEFAULT 0 NOT NULL,
        monitoring_enabled integer DEFAULT 1 NOT NULL,
        accessibility_disclosure_accepted integer DEFAULT 0 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO focus_settings (
        id, enabled, default_duration_minutes, hardcore_mode,
        monitoring_enabled, accessibility_disclosure_accepted, updated_at
      )
      VALUES (1, 1, 30, 0, 1, 0, datetime('now'))
    `);
  }

  if (!tableExists(sqlite, 'focus_blocked_apps')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS focus_blocked_apps (
        package_name text PRIMARY KEY NOT NULL,
        label text NOT NULL,
        category text NOT NULL,
        enabled integer DEFAULT 1 NOT NULL,
        is_default integer DEFAULT 0 NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'focus_sessions')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        study_type text NOT NULL,
        planned_duration_sec integer NOT NULL,
        status text NOT NULL,
        started_at text NOT NULL,
        ended_at text,
        focused_seconds integer DEFAULT 0 NOT NULL,
        distracted_seconds integer DEFAULT 0 NOT NULL,
        idle_seconds integer DEFAULT 0 NOT NULL,
        pause_seconds integer DEFAULT 0 NOT NULL,
        words_learned integer DEFAULT 0 NOT NULL,
        xp_earned integer DEFAULT 0 NOT NULL,
        coins_earned integer DEFAULT 0 NOT NULL,
        sp_earned integer DEFAULT 0 NOT NULL,
        bonus_multiplier real DEFAULT 1 NOT NULL,
        loot_box_granted integer DEFAULT 0 NOT NULL,
        loot_box_rarity text,
        abandon_reason text
      )
    `);
  }

  if (!tableExists(sqlite, 'focus_session_events')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS focus_session_events (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        session_id integer NOT NULL,
        event_type text NOT NULL,
        package_name text,
        duration_sec integer,
        occurred_at text NOT NULL,
        metadata_json text
      )
    `);
  }

  if (!tableExists(sqlite, 'focus_analytics')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS focus_analytics (
        id integer PRIMARY KEY NOT NULL,
        total_sessions integer DEFAULT 0 NOT NULL,
        completed_sessions integer DEFAULT 0 NOT NULL,
        abandoned_sessions integer DEFAULT 0 NOT NULL,
        total_focus_seconds integer DEFAULT 0 NOT NULL,
        total_distraction_seconds integer DEFAULT 0 NOT NULL,
        total_xp_earned integer DEFAULT 0 NOT NULL,
        total_coins_earned integer DEFAULT 0 NOT NULL,
        total_sp_earned integer DEFAULT 0 NOT NULL,
        total_loot_boxes integer DEFAULT 0 NOT NULL,
        last_session_at text
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO focus_analytics (
        id, total_sessions, completed_sessions, abandoned_sessions,
        total_focus_seconds, total_distraction_seconds, total_xp_earned,
        total_coins_earned, total_sp_earned, total_loot_boxes
      )
      VALUES (1, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    `);
  }

  ensureMigrationApplied(sqlite, '0023_focus_mode');
};
