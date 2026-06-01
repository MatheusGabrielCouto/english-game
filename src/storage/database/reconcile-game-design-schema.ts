import type { SQLiteDatabase } from 'expo-sqlite';

type TableInfoRow = {
  name: string;
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

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

/**
 * Repairs databases where migrations ran without statement-breakpoints
 * (Drizzle Expo only executes the first statement per migration file).
 */
export const reconcileGameDesignSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'player_statistics')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS player_statistics (
        id integer PRIMARY KEY NOT NULL,
        total_study_minutes integer DEFAULT 0 NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'statistics_milestones')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS statistics_milestones (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        category text NOT NULL,
        milestone_key text NOT NULL,
        label text NOT NULL,
        value integer,
        metadata_json text,
        occurred_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      CREATE UNIQUE INDEX IF NOT EXISTS statistics_milestones_key_idx
      ON statistics_milestones (milestone_key)
    `);
    sqlite.execSync(`
      CREATE INDEX IF NOT EXISTS statistics_milestones_occurred_at_idx
      ON statistics_milestones (occurred_at)
    `);
  }

  if (tableExists(sqlite, 'app_settings')) {
    addColumnIfMissing(sqlite, 'app_settings', 'difficulty', "text DEFAULT 'balanced' NOT NULL");
    addColumnIfMissing(sqlite, 'app_settings', 'avatar_frame', "text DEFAULT 'default' NOT NULL");
    addColumnIfMissing(sqlite, 'app_settings', 'avatar_badge', 'text');
    addColumnIfMissing(sqlite, 'app_settings', 'weekly_loot_granted_week', 'text');
    addColumnIfMissing(sqlite, 'app_settings', 'loot_pity_counter', 'integer DEFAULT 0 NOT NULL');
  }

  if (tableExists(sqlite, 'daily_missions')) {
    addColumnIfMissing(sqlite, 'daily_missions', 'category', 'text');
    addColumnIfMissing(sqlite, 'daily_missions', 'difficulty', 'text');
    addColumnIfMissing(sqlite, 'daily_missions', 'template_key', 'text');
  }

  if (tableExists(sqlite, 'pets')) {
    addColumnIfMissing(sqlite, 'pets', 'species_key', "text DEFAULT 'codeowl' NOT NULL");
    addColumnIfMissing(sqlite, 'pets', 'energy', 'integer DEFAULT 100 NOT NULL');
    addColumnIfMissing(sqlite, 'pets', 'hunger', 'integer DEFAULT 100 NOT NULL');
    addColumnIfMissing(sqlite, 'pets', 'happiness', 'integer DEFAULT 100 NOT NULL');
    addColumnIfMissing(sqlite, 'pets', 'motivation', 'integer DEFAULT 100 NOT NULL');
    addColumnIfMissing(sqlite, 'pets', 'affinity', 'integer DEFAULT 0 NOT NULL');
    addColumnIfMissing(sqlite, 'pets', 'is_incubating', 'integer DEFAULT 0 NOT NULL');
    addColumnIfMissing(sqlite, 'pets', 'hatch_at', 'text');
    addColumnIfMissing(sqlite, 'pets', 'name', "text DEFAULT 'Buddy'");
    addColumnIfMissing(sqlite, 'pets', 'equipped_cosmetics_json', "text DEFAULT '{}'");
    addColumnIfMissing(sqlite, 'pets', 'last_interaction_at', 'text');
    addColumnIfMissing(sqlite, 'pets', 'routine_phase', "text DEFAULT 'morning'");
    addColumnIfMissing(sqlite, 'pets', 'current_animation_key', "text DEFAULT 'idle_respirando_v1'");
  }

  if (!tableExists(sqlite, 'player_rpg')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS player_rpg (
        id integer PRIMARY KEY NOT NULL,
        intelligence integer DEFAULT 1 NOT NULL,
        discipline integer DEFAULT 1 NOT NULL,
        communication integer DEFAULT 1 NOT NULL,
        confidence integer DEFAULT 1 NOT NULL,
        fluency integer DEFAULT 1 NOT NULL,
        unlocked_perks_json text DEFAULT '[]' NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'epic_mission_progress')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS epic_mission_progress (
        id text PRIMARY KEY NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        mission_type text NOT NULL,
        target_value integer NOT NULL,
        current_value integer DEFAULT 0 NOT NULL,
        xp_reward integer NOT NULL,
        coin_reward integer NOT NULL,
        difficulty text NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        started_at text NOT NULL,
        completed_at text
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_collection')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_collection (
        species_key text PRIMARY KEY NOT NULL,
        discovered_at text NOT NULL,
        times_owned integer DEFAULT 1 NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'active_boosters')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS active_boosters (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        booster_key text NOT NULL,
        multiplier real NOT NULL,
        expires_at text NOT NULL,
        source text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_memories')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_memories (
        memory_key text PRIMARY KEY NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        icon text NOT NULL,
        unlocked_at text NOT NULL
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
      INSERT OR IGNORE INTO study_points (id, balance, lifetime_earned, lifetime_spent, updated_at)
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

  if (!tableExists(sqlite, 'punishment_state')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS punishment_state (
        id integer PRIMARY KEY NOT NULL,
        active_penalties_json text DEFAULT '[]' NOT NULL,
        recovery_streak_days integer DEFAULT 0 NOT NULL,
        last_app_open_at text,
        last_recovery_at text,
        pending_warning_json text,
        city_vibrancy integer DEFAULT 100 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO punishment_state (id, active_penalties_json, recovery_streak_days, city_vibrancy, updated_at)
      VALUES (1, '[]', 0, 100, datetime('now'))
    `);
  }

  if (!tableExists(sqlite, 'punishment_history')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS punishment_history (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        trigger_type text NOT NULL,
        severity text NOT NULL,
        xp_decay_percent integer DEFAULT 0 NOT NULL,
        coin_decay_percent integer DEFAULT 0 NOT NULL,
        loot_luck_reduction integer DEFAULT 0 NOT NULL,
        contract_penalty integer DEFAULT 0 NOT NULL,
        pet_mood_override text,
        city_vibrancy integer DEFAULT 100 NOT NULL,
        applied_at text NOT NULL,
        recovered_at text,
        metadata_json text
      )
    `);
  }

  if (!tableExists(sqlite, 'punishment_analytics')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS punishment_analytics (
        id integer PRIMARY KEY NOT NULL,
        total_applied integer DEFAULT 0 NOT NULL,
        total_recovered integer DEFAULT 0 NOT NULL,
        total_warnings integer DEFAULT 0 NOT NULL,
        streak_failures integer DEFAULT 0 NOT NULL,
        contract_failures integer DEFAULT 0 NOT NULL,
        focus_failures integer DEFAULT 0 NOT NULL,
        inactivity_failures integer DEFAULT 0 NOT NULL,
        avg_recovery_days real DEFAULT 0 NOT NULL,
        last_applied_at text,
        last_recovered_at text
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO punishment_analytics (id, total_applied, total_recovered, total_warnings)
      VALUES (1, 0, 0, 0)
    `);
  }
};
