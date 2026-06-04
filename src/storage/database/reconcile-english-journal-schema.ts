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

export const reconcileEnglishJournalSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'journal_entries')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id text PRIMARY KEY NOT NULL,
        entry_type text NOT NULL,
        title text NOT NULL,
        body text,
        category text NOT NULL,
        importance text NOT NULL DEFAULT 'medium',
        tags_json text NOT NULL DEFAULT '[]',
        audio_uri text,
        audio_duration_ms integer,
        is_favorite integer DEFAULT 0 NOT NULL,
        is_archived integer DEFAULT 0 NOT NULL,
        review_stage integer DEFAULT 0 NOT NULL,
        review_count integer DEFAULT 0 NOT NULL,
        next_review_at text,
        last_reviewed_at text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `);
  }

  if (!tableExists(sqlite, 'journal_stats')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS journal_stats (
        id integer PRIMARY KEY NOT NULL,
        total_entries integer DEFAULT 0 NOT NULL,
        total_voice_notes integer DEFAULT 0 NOT NULL,
        total_text_notes integer DEFAULT 0 NOT NULL,
        total_reviews integer DEFAULT 0 NOT NULL,
        total_voice_ms integer DEFAULT 0 NOT NULL,
        total_xp_from_journal integer DEFAULT 0 NOT NULL,
        knowledge_progress integer DEFAULT 0 NOT NULL,
        updated_at text NOT NULL
      )
    `);
    sqlite.execSync(`
      INSERT OR IGNORE INTO journal_stats (
        id, total_entries, total_voice_notes, total_text_notes,
        total_reviews, total_voice_ms, total_xp_from_journal, knowledge_progress, updated_at
      ) VALUES (1, 0, 0, 0, 0, 0, 0, 0, datetime('now'))
    `);
  }

  if (tableExists(sqlite, 'achievement_stats')) {
    if (!columnExists(sqlite, 'achievement_stats', 'total_journal_entries')) {
      sqlite.execSync(
        `ALTER TABLE achievement_stats ADD COLUMN total_journal_entries integer DEFAULT 0 NOT NULL`,
      );
    }
    if (!columnExists(sqlite, 'achievement_stats', 'total_journal_voice_notes')) {
      sqlite.execSync(
        `ALTER TABLE achievement_stats ADD COLUMN total_journal_voice_notes integer DEFAULT 0 NOT NULL`,
      );
    }
    if (!columnExists(sqlite, 'achievement_stats', 'total_journal_reviews')) {
      sqlite.execSync(
        `ALTER TABLE achievement_stats ADD COLUMN total_journal_reviews integer DEFAULT 0 NOT NULL`,
      );
    }
  }

  ensureMigrationApplied(sqlite, '0039_english_journal');
};
