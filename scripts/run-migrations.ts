import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Database from 'better-sqlite3';

import journal from '../drizzle/meta/_journal.json';
import {
    runResilientMigrations,
    type MigrationEntry,
    type ResilientMigratorSqlite,
} from '../src/storage/database/resilient-migrator';

const DRIZZLE_DIR = resolve(process.cwd(), 'drizzle');
const DB_PATH = resolve(process.cwd(), '.data/english-quest-dev.db');

const toResilientMigratorSqlite = (sqlite: Database.Database): ResilientMigratorSqlite => ({
  execSync: (sql) => {
    sqlite.exec(sql);
  },
  getAllSync: (sql, ...params) => sqlite.prepare(sql).all(...params),
});

const tableExists = (sqlite: Database.Database, table: string): boolean => {
  const row = sqlite
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(table) as { name: string } | undefined;
  return Boolean(row);
};

const columnExists = (sqlite: Database.Database, table: string, column: string): boolean => {
  const rows = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.some((row) => row.name === column);
};

const addColumnIfMissing = (
  sqlite: Database.Database,
  table: string,
  column: string,
  definition: string,
): void => {
  if (!tableExists(sqlite, table) || columnExists(sqlite, table, column)) return;
  sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};

const reconcileSchema = (sqlite: Database.Database): void => {
  addColumnIfMissing(sqlite, 'pets', 'name', "text DEFAULT 'Buddy'");
  addColumnIfMissing(sqlite, 'pets', 'equipped_cosmetics_json', "text DEFAULT '{}'");
  addColumnIfMissing(sqlite, 'pets', 'last_interaction_at', 'text');
  addColumnIfMissing(sqlite, 'pets', 'routine_phase', "text DEFAULT 'morning'");
  addColumnIfMissing(
    sqlite,
    'pets',
    'current_animation_key',
    "text DEFAULT 'idle_respirando_v1'",
  );
  addColumnIfMissing(sqlite, 'app_settings', 'weekly_loot_granted_week', 'text');
  addColumnIfMissing(sqlite, 'app_settings', 'loot_pity_counter', 'integer DEFAULT 0 NOT NULL');

  if (!tableExists(sqlite, 'pet_memories')) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS pet_memories (
        memory_key text PRIMARY KEY NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        icon text NOT NULL,
        unlocked_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'pet_collection')) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS pet_collection (
        species_key text PRIMARY KEY NOT NULL,
        discovered_at text NOT NULL,
        times_owned integer DEFAULT 1 NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'wishlist')) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS wishlist (
        item_key text PRIMARY KEY NOT NULL,
        added_at text NOT NULL
      )
    `);
  }
};

mkdirSync(resolve(process.cwd(), '.data'), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

const entries: MigrationEntry[] = journal.entries.map((entry) => ({
  tag: entry.tag,
  sql: readFileSync(resolve(DRIZZLE_DIR, `${entry.tag}.sql`), 'utf8'),
}));

console.log(`[db:migrate] Applying migrations to ${DB_PATH}`);

const { applied, skipped } = runResilientMigrations(toResilientMigratorSqlite(sqlite), entries);
reconcileSchema(sqlite);

console.log(`[db:migrate] Done. Applied: ${applied}, skipped: ${skipped}.`);
sqlite.close();
