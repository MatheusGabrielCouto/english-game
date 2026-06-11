import type { SQLiteDatabase } from 'expo-sqlite'

import { ensureMigrationApplied } from './resilient-migrator'

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[]

  return rows.length > 0
}

/** Denormalized search table — avoids FTS5 virtual tables (crash on Expo fast refresh). */
export const reconcileJournalSearchSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'journal_entries')) return

  if (tableExists(sqlite, 'journal_entries_fts')) {
    sqlite.execSync('DROP TABLE IF EXISTS journal_entries_fts')
  }

  sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS journal_entry_search (
      entry_id TEXT PRIMARY KEY NOT NULL,
      search_text TEXT NOT NULL
    )
  `)

  const [{ indexed }] = sqlite.getAllSync(
    `SELECT count(*) as indexed FROM journal_entry_search`,
  ) as { indexed: number }[]

  const [{ active }] = sqlite.getAllSync(
    `SELECT count(*) as active FROM journal_entries WHERE is_archived = 0`,
  ) as { active: number }[]

  if (Number(indexed) === 0 && Number(active) > 0) {
    sqlite.execSync(`
      INSERT OR IGNORE INTO journal_entry_search (entry_id, search_text)
      SELECT
        id,
        lower(trim(title || ' ' || coalesce(body, '') || ' ' || tags_json || ' ' || category))
      FROM journal_entries
      WHERE is_archived = 0
    `)
  }

  ensureMigrationApplied(sqlite, '0048_journal_search')
}
