import type { SQLiteDatabase } from 'expo-sqlite';

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

export const reconcileCityEventsSchema = (sqlite: SQLiteDatabase): void => {
  const missionColumns = sqlite.getAllSync(`PRAGMA table_info(city_poi_missions)`) as {
    name: string;
  }[];
  const hasEventKey = missionColumns.some((c) => c.name === 'event_key');
  if (!hasEventKey) {
    sqlite.execSync(`ALTER TABLE city_poi_missions ADD COLUMN event_key text`);
  }

  if (!tableExists(sqlite, 'city_event_state')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_event_state (
        event_key text PRIMARY KEY NOT NULL,
        spirit_progress integer DEFAULT 0 NOT NULL,
        vocab_words_learned integer DEFAULT 0 NOT NULL,
        intro_seen integer DEFAULT 0 NOT NULL,
        completed_at text,
        started_at text,
        updated_at text NOT NULL
      )
    `);
  }
};
