import type { SQLiteDatabase } from 'expo-sqlite'

import { ensureMigrationApplied } from './resilient-migrator'

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[]

  return rows.length > 0
}

export const reconcileMentorAiSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'mentor_memory')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS mentor_memory (
        key text PRIMARY KEY NOT NULL,
        value_json text NOT NULL,
        updated_at text NOT NULL
      )
    `)
  }

  if (!tableExists(sqlite, 'mentor_chat_sessions')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS mentor_chat_sessions (
        id text PRIMARY KEY NOT NULL,
        mode text NOT NULL,
        title text NOT NULL,
        messages_json text NOT NULL DEFAULT '[]',
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `)
    sqlite.execSync(`
      CREATE INDEX IF NOT EXISTS idx_mentor_chat_sessions_updated
      ON mentor_chat_sessions (updated_at DESC)
    `)
  }

  if (!tableExists(sqlite, 'mentor_error_log')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS mentor_error_log (
        id text PRIMARY KEY NOT NULL,
        category text NOT NULL,
        original text NOT NULL,
        corrected text NOT NULL,
        occurred_at text NOT NULL
      )
    `)
    sqlite.execSync(`
      CREATE INDEX IF NOT EXISTS idx_mentor_error_log_occurred
      ON mentor_error_log (occurred_at DESC)
    `)
  }

  ensureMigrationApplied(sqlite, '0047_mentor_ai_foundation')
}
