import type { SQLiteDatabase } from 'expo-sqlite';

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

export const reconcileLivingCitySchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'city_districts')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_districts (
        district_key text PRIMARY KEY NOT NULL,
        unlocked_at text,
        unlock_reason text
      )
    `);
  }

  if (!tableExists(sqlite, 'city_pois')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_pois (
        poi_key text PRIMARY KEY NOT NULL,
        district_key text NOT NULL,
        category text NOT NULL,
        local_level integer DEFAULT 1 NOT NULL,
        local_xp integer DEFAULT 0 NOT NULL,
        position_x real NOT NULL,
        position_y real NOT NULL,
        unlocked_at text,
        visual_stage integer DEFAULT 1 NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'city_map_state')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_map_state (
        id integer PRIMARY KEY NOT NULL,
        city_name text NOT NULL,
        city_vitality integer DEFAULT 100 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO city_map_state (id, city_name, city_vitality, updated_at)
      VALUES (1, 'Minha Cidade', 100, datetime('now'))
    `);
  }

  if (!tableExists(sqlite, 'city_poi_missions')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_poi_missions (
        id text PRIMARY KEY NOT NULL,
        poi_key text NOT NULL,
        mission_date text NOT NULL,
        template_key text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        mission_type text NOT NULL,
        target_value integer NOT NULL,
        current_value integer DEFAULT 0 NOT NULL,
        xp_reward integer NOT NULL,
        coin_reward integer NOT NULL,
        local_xp_reward integer NOT NULL,
        completed integer DEFAULT false NOT NULL,
        claimed integer DEFAULT false NOT NULL,
        created_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      CREATE INDEX IF NOT EXISTS city_poi_missions_date_idx
      ON city_poi_missions (mission_date)
    `);
    sqlite.execSync(`
      CREATE INDEX IF NOT EXISTS city_poi_missions_poi_date_idx
      ON city_poi_missions (poi_key, mission_date)
    `);
  }

  if (!tableExists(sqlite, 'city_resources')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_resources (
        resource_type text PRIMARY KEY NOT NULL,
        balance integer DEFAULT 0 NOT NULL
      )
    `);
    for (const resourceType of ['lexicon_brick', 'fluency_cement', 'consistency_wood']) {
      sqlite.runSync(
        `INSERT OR IGNORE INTO city_resources (resource_type, balance) VALUES (?, 0)`,
        [resourceType],
      );
    }
  }

  if (!tableExists(sqlite, 'city_poi_projects')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_poi_projects (
        id text PRIMARY KEY NOT NULL,
        poi_key text NOT NULL,
        project_key text NOT NULL,
        week_start_date text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        resource_type text NOT NULL,
        target_total integer NOT NULL,
        delivery_chunk integer NOT NULL,
        progress integer DEFAULT 0 NOT NULL,
        local_xp_on_complete integer NOT NULL,
        vitality_on_complete integer NOT NULL,
        completed_at text,
        created_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      CREATE INDEX IF NOT EXISTS city_poi_projects_poi_week_idx
      ON city_poi_projects (poi_key, week_start_date)
    `);
  }

  const mapStateColumns = sqlite.getAllSync(`PRAGMA table_info(city_map_state)`) as {
    name: string;
  }[];
  const hasRumorKey = mapStateColumns.some((c) => c.name === 'active_rumor_key');
  if (!hasRumorKey) {
    sqlite.execSync(`ALTER TABLE city_map_state ADD COLUMN active_rumor_key text`);
    sqlite.execSync(`ALTER TABLE city_map_state ADD COLUMN rumor_updated_at text`);
  }

  if (!tableExists(sqlite, 'city_poi_visits')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_poi_visits (
        poi_key text NOT NULL,
        visit_date text NOT NULL,
        pet_visit_bonus integer DEFAULT 0 NOT NULL,
        visited_at text NOT NULL,
        PRIMARY KEY (poi_key, visit_date)
      )
    `);
  }

  if (!tableExists(sqlite, 'city_resource_delivery_caps')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_resource_delivery_caps (
        resource_type text NOT NULL,
        delivery_date text NOT NULL,
        amount integer DEFAULT 0 NOT NULL,
        PRIMARY KEY (resource_type, delivery_date)
      )
    `);
  }
};
