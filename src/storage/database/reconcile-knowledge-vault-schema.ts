import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureMigrationApplied } from './resilient-migrator';

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[];
  return rows.length > 0;
};

const columnExists = (sqlite: SQLiteDatabase, table: string, column: string): boolean => {
  const rows = sqlite.getAllSync(`PRAGMA table_info(${table})`) as { name: string }[];
  return rows.some((row) => row.name === column);
};

export const reconcileKnowledgeVaultSchema = (sqlite: SQLiteDatabase): void => {
  if (tableExists(sqlite, 'journal_entries')) {
    if (!columnExists(sqlite, 'journal_entries', 'space_key')) {
      sqlite.execSync(
        `ALTER TABLE journal_entries ADD COLUMN space_key text DEFAULT 'personal_notes' NOT NULL`,
      );
    }
    if (!columnExists(sqlite, 'journal_entries', 'folder_id')) {
      sqlite.execSync(`ALTER TABLE journal_entries ADD COLUMN folder_id text`);
    }
    if (!columnExists(sqlite, 'journal_entries', 'is_pinned')) {
      sqlite.execSync(`ALTER TABLE journal_entries ADD COLUMN is_pinned integer DEFAULT 0 NOT NULL`);
    }
  }

  if (!tableExists(sqlite, 'journal_folders')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS journal_folders (
        id text PRIMARY KEY NOT NULL,
        space_key text NOT NULL,
        parent_id text,
        name text NOT NULL,
        slug text NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        created_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'journal_entry_links')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS journal_entry_links (
        from_entry_id text NOT NULL,
        to_entry_id text NOT NULL,
        created_at text NOT NULL,
        PRIMARY KEY (from_entry_id, to_entry_id)
      )
    `);
  }

  if (!tableExists(sqlite, 'journal_collections')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS journal_collections (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        description text,
        emoji text DEFAULT '📚' NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'journal_entry_collections')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS journal_entry_collections (
        entry_id text NOT NULL,
        collection_id text NOT NULL,
        created_at text NOT NULL,
        PRIMARY KEY (entry_id, collection_id)
      )
    `);
  }

  if (tableExists(sqlite, 'journal_stats')) {
    const statCols: [string, string][] = [
      ['knowledge_points', 'integer DEFAULT 0 NOT NULL'],
      ['knowledge_level', 'integer DEFAULT 1 NOT NULL'],
      ['knowledge_mastery_bps', 'integer DEFAULT 0 NOT NULL'],
      ['total_connections', 'integer DEFAULT 0 NOT NULL'],
      ['total_collections', 'integer DEFAULT 0 NOT NULL'],
      ['library_tier', 'integer DEFAULT 0 NOT NULL'],
    ];
    for (const [col, def] of statCols) {
      if (!columnExists(sqlite, 'journal_stats', col)) {
        sqlite.execSync(`ALTER TABLE journal_stats ADD COLUMN ${col} ${def}`);
      }
    }
  }

  if (
    tableExists(sqlite, 'achievement_stats') &&
    !columnExists(sqlite, 'achievement_stats', 'total_journal_connections')
  ) {
    sqlite.execSync(
      `ALTER TABLE achievement_stats ADD COLUMN total_journal_connections integer DEFAULT 0 NOT NULL`,
    );
  }

  ensureMigrationApplied(sqlite, '0040_knowledge_vault');
};
