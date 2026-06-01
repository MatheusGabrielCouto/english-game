import type { SQLiteDatabase } from 'expo-sqlite';

type TableInfoRow = { name: string };

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

const getColumnNames = (sqlite: SQLiteDatabase, table: string): Set<string> => {
  const rows = sqlite.getAllSync(`PRAGMA table_info(${table})`) as TableInfoRow[];
  return new Set(rows.map((row) => row.name));
};

const addColumnIfMissing = (
  sqlite: SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
): void => {
  if (!tableExists(sqlite, table)) return;
  const columns = getColumnNames(sqlite, table);
  if (columns.has(column)) return;
  sqlite.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};

/**
 * Ensures career/metagame tables exist when migration 0018 was skipped
 * (journal idx mismatch caused m0017 to run instead of m0018).
 */
export const reconcileCareerMetagameSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'career_progress')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS career_progress (
        id integer PRIMARY KEY NOT NULL,
        current_role_key text DEFAULT 'student' NOT NULL,
        current_company_key text DEFAULT 'startup_local' NOT NULL,
        english_score integer DEFAULT 0 NOT NULL,
        completed_interviews_json text DEFAULT '[]' NOT NULL,
        unlocked_offers_json text DEFAULT '[]' NOT NULL,
        dream_progress_json text DEFAULT '{}' NOT NULL,
        promotions_count integer DEFAULT 0 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT INTO career_progress (
        id,
        current_role_key,
        current_company_key,
        english_score,
        completed_interviews_json,
        unlocked_offers_json,
        dream_progress_json,
        promotions_count,
        updated_at
      ) VALUES (
        1,
        'student',
        'startup_local',
        0,
        '[]',
        '[]',
        '{}',
        0,
        datetime('now')
      )
    `);
  }

  if (!tableExists(sqlite, 'career_events')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS career_events (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        event_type text NOT NULL,
        event_key text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        occurred_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'metagame_state')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS metagame_state (
        id integer PRIMARY KEY NOT NULL,
        prestige_level integer DEFAULT 0 NOT NULL,
        season_key text NOT NULL,
        season_points integer DEFAULT 0 NOT NULL,
        annual_progress_json text DEFAULT '{}' NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT INTO metagame_state (
        id,
        prestige_level,
        season_key,
        season_points,
        annual_progress_json,
        updated_at
      ) VALUES (
        1,
        0,
        '2026-01',
        0,
        '{}',
        datetime('now')
      )
    `);
  }

  if (!tableExists(sqlite, 'legacy_milestones')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS legacy_milestones (
        milestone_key text PRIMARY KEY NOT NULL,
        category text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        occurred_at text NOT NULL,
        recorded_at text NOT NULL
      )
    `);
  }

  addColumnIfMissing(
    sqlite,
    'metagame_state',
    'season_claimed_tiers_json',
    "text DEFAULT '[]' NOT NULL",
  );

  if (!tableExists(sqlite, 'notification_settings')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id integer PRIMARY KEY NOT NULL,
        enabled integer DEFAULT 1 NOT NULL,
        preferred_hour integer DEFAULT 19 NOT NULL,
        preferred_minute integer DEFAULT 0 NOT NULL,
        daily_reminder integer DEFAULT 1 NOT NULL,
        streak_reminder integer DEFAULT 1 NOT NULL,
        shield_warning integer DEFAULT 1 NOT NULL,
        pet_reminder integer DEFAULT 1 NOT NULL,
        contract_reminder integer DEFAULT 1 NOT NULL,
        achievement_progress integer DEFAULT 1 NOT NULL,
        city_progress integer DEFAULT 1 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT INTO notification_settings (
        id,
        enabled,
        preferred_hour,
        preferred_minute,
        daily_reminder,
        streak_reminder,
        shield_warning,
        pet_reminder,
        contract_reminder,
        achievement_progress,
        city_progress,
        updated_at
      ) VALUES (
        1,
        1,
        19,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        datetime('now')
      )
    `);
  }

  if (!tableExists(sqlite, 'notification_history')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        category text NOT NULL,
        title text NOT NULL,
        body text NOT NULL,
        status text NOT NULL,
        identifier text NOT NULL,
        scheduled_for text,
        delivered_at text,
        opened_at text,
        created_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'study_points')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS study_points (
        id integer PRIMARY KEY NOT NULL,
        balance integer DEFAULT 0 NOT NULL,
        lifetime_earned integer DEFAULT 0 NOT NULL,
        lifetime_spent integer DEFAULT 0 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT INTO study_points (id, balance, lifetime_earned, lifetime_spent, updated_at)
      VALUES (1, 0, 0, 0, datetime('now'))
    `);
  }

  if (!tableExists(sqlite, 'study_points_history')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS study_points_history (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        amount integer NOT NULL,
        reason text NOT NULL,
        source text NOT NULL,
        created_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'collection_book')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS collection_book (
        item_key text PRIMARY KEY NOT NULL,
        category text NOT NULL,
        rarity text NOT NULL,
        discovered_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'farm_sessions')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS farm_sessions (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        activity_type text NOT NULL,
        amount integer NOT NULL,
        study_points_earned integer NOT NULL,
        coins_earned integer NOT NULL,
        recorded_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'wishlist')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS wishlist (
        item_key text PRIMARY KEY NOT NULL,
        added_at text NOT NULL
      )
    `);
  }
};
