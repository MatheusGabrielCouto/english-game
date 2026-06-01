import type { SQLiteDatabase } from 'expo-sqlite';

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

export const reconcileCityPolishSchema = (sqlite: SQLiteDatabase): void => {
  const poiColumns = sqlite.getAllSync(`PRAGMA table_info(city_pois)`) as { name: string }[];
  if (!poiColumns.some((c) => c.name === 'npc_trust')) {
    sqlite.execSync(`ALTER TABLE city_pois ADD COLUMN npc_trust integer DEFAULT 50 NOT NULL`);
  }

  const missionColumns = sqlite.getAllSync(`PRAGMA table_info(city_poi_missions)`) as {
    name: string;
  }[];
  if (!missionColumns.some((c) => c.name === 'chain_key')) {
    sqlite.execSync(`ALTER TABLE city_poi_missions ADD COLUMN chain_key text`);
  }
  if (!missionColumns.some((c) => c.name === 'chain_step')) {
    sqlite.execSync(`ALTER TABLE city_poi_missions ADD COLUMN chain_step integer`);
  }

  if (!tableExists(sqlite, 'city_poi_chain_progress')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_poi_chain_progress (
        poi_key text NOT NULL,
        chain_key text NOT NULL,
        current_step integer DEFAULT 0 NOT NULL,
        completed integer DEFAULT 0 NOT NULL,
        updated_at text NOT NULL,
        PRIMARY KEY (poi_key, chain_key)
      )
    `);
  }
};
