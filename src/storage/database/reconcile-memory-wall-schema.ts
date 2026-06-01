import type { SQLiteDatabase } from 'expo-sqlite';

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];

  return rows.length > 0;
};

export const reconcileMemoryWallSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'lemma_mastery')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS lemma_mastery (
        lemma_id text PRIMARY KEY NOT NULL,
        lemma text NOT NULL,
        translation text NOT NULL,
        recognition_score integer DEFAULT 0 NOT NULL,
        production_score integer DEFAULT 0 NOT NULL,
        last_review_at text NOT NULL,
        next_review_at text NOT NULL,
        decay_stage integer DEFAULT 0 NOT NULL,
        theme_tags_json text NOT NULL,
        contexts_seen_json text DEFAULT '[]' NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'lexicon_bricks')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS lexicon_bricks (
        brick_id text PRIMARY KEY NOT NULL,
        lemma_id text NOT NULL,
        lemma text NOT NULL,
        translation text NOT NULL,
        theme_tags_json text NOT NULL,
        source text NOT NULL,
        minted_at text NOT NULL,
        last_review_at text NOT NULL,
        next_review_at text NOT NULL,
        decay_stage integer DEFAULT 0 NOT NULL,
        placed_poi_key text,
        placed_project_key text,
        placed_at text
      )
    `);
    sqlite.execSync(
      `CREATE INDEX IF NOT EXISTS idx_lexicon_bricks_lemma ON lexicon_bricks (lemma_id)`,
    );
  }

  if (!tableExists(sqlite, 'city_poi_project_slot_progress')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS city_poi_project_slot_progress (
        project_id text NOT NULL,
        slot_index integer NOT NULL,
        theme_tag text NOT NULL,
        label text NOT NULL,
        target_count integer NOT NULL,
        filled_count integer DEFAULT 0 NOT NULL,
        PRIMARY KEY (project_id, slot_index)
      )
    `);
  }
};
