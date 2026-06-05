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
    addColumnIfMissing(sqlite, 'pets', 'instance_id', 'integer');
  }

  if (!tableExists(sqlite, 'pet_instances')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_instances (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        species_key text NOT NULL,
        gender text NOT NULL,
        nickname text NOT NULL,
        stage text NOT NULL,
        level integer DEFAULT 1 NOT NULL,
        experience integer DEFAULT 0 NOT NULL,
        stats_json text DEFAULT '{}' NOT NULL,
        effective_passive_value real DEFAULT 0 NOT NULL,
        passive_field_slot integer,
        breeding_pen_slot integer,
        is_active integer DEFAULT 0 NOT NULL,
        parent_mother_id integer,
        parent_father_id integer,
        generation integer DEFAULT 1 NOT NULL,
        trait_keys_json text DEFAULT '[]' NOT NULL,
        personality_key text DEFAULT 'friendly' NOT NULL,
        breeding_cooldown_until text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (tableExists(sqlite, 'pet_instances')) {
    addColumnIfMissing(sqlite, 'pet_instances', 'generation', 'integer DEFAULT 1 NOT NULL');
    addColumnIfMissing(sqlite, 'pet_instances', 'trait_keys_json', "text DEFAULT '[]' NOT NULL");
    addColumnIfMissing(sqlite, 'pet_instances', 'personality_key', "text DEFAULT 'friendly' NOT NULL");
    addColumnIfMissing(sqlite, 'pet_instances', 'favorite_tag', "text DEFAULT 'none' NOT NULL");
    addColumnIfMissing(sqlite, 'pet_instances', 'hall_of_fame_slot', 'integer');
    addColumnIfMissing(sqlite, 'pet_instances', 'total_adventures', 'integer DEFAULT 0 NOT NULL');
    addColumnIfMissing(
      sqlite,
      'pet_instances',
      'equipped_cosmetics_json',
      "text DEFAULT '{}' NOT NULL",
    );
  }

  if (!tableExists(sqlite, 'pet_farm_fields')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_farm_fields (
        field_key text PRIMARY KEY NOT NULL,
        level integer DEFAULT 1 NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO pet_farm_fields (field_key, level) VALUES
        ('passive_pasture', 1),
        ('breeding_pen', 1),
        ('incubator_room', 2),
        ('barn_storage', 12)
    `);
  }

  if (!tableExists(sqlite, 'pet_farm_meta')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_farm_meta (
        id integer PRIMARY KEY NOT NULL,
        farm_xp integer DEFAULT 0 NOT NULL
      )
    `);
    sqlite.execSync(`INSERT OR IGNORE INTO pet_farm_meta (id, farm_xp) VALUES (1, 0)`);
  }

  if (!tableExists(sqlite, 'pet_incubators')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_incubators (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        species_key text NOT NULL,
        source text NOT NULL,
        hatch_at text NOT NULL,
        parent_mother_id integer,
        parent_father_id integer,
        predicted_stats_json text,
        created_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_instance_memories')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_instance_memories (
        instance_id integer NOT NULL,
        memory_key text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        icon text NOT NULL,
        unlocked_at text NOT NULL,
        PRIMARY KEY (instance_id, memory_key)
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_breeding_log')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_breeding_log (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        mother_instance_id integer NOT NULL,
        father_instance_id integer NOT NULL,
        outcome_species_key text NOT NULL,
        rolled_stats_json text NOT NULL,
        parent_stats_snapshot_json text NOT NULL,
        outcome_weights_snapshot_json text NOT NULL,
        rolled_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_adventures')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_adventures (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        instance_id integer NOT NULL,
        biome_key text NOT NULL,
        duration_key text NOT NULL,
        started_at text NOT NULL,
        ends_at text NOT NULL,
        created_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_adventure_24h_log')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_adventure_24h_log (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        claimed_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_academy_sessions')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_academy_sessions (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        instance_id integer NOT NULL,
        track_key text NOT NULL,
        started_at text NOT NULL,
        ends_at text NOT NULL,
        created_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_league_meta')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_league_meta (
        id integer PRIMARY KEY NOT NULL,
        season_key text NOT NULL,
        season_start_iso text NOT NULL,
        claimed_reward_tiers_json text DEFAULT '[]' NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_league_entries')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_league_entries (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        instance_id integer NOT NULL,
        season_key text NOT NULL,
        division text NOT NULL,
        wins integer DEFAULT 0 NOT NULL,
        losses integer DEFAULT 0 NOT NULL,
        win_streak integer DEFAULT 0 NOT NULL,
        peak_rating integer DEFAULT 0 NOT NULL,
        battles_today integer DEFAULT 0 NOT NULL,
        battles_day_iso text,
        last_battle_at text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_cosmetic_inventory')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS pet_cosmetic_inventory (
        instance_id integer NOT NULL,
        cosmetic_key text NOT NULL,
        acquired_at text NOT NULL,
        source text NOT NULL,
        PRIMARY KEY (instance_id, cosmetic_key)
      )
    `);
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
