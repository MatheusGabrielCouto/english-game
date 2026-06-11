import { getSqlite } from '../database/client'

import { buildJournalSearchLikeClause } from './journal-search-query'

const SEARCH_TABLE = 'journal_entry_search'

const isSearchIndexAvailable = (): boolean => {
  try {
    const sqlite = getSqlite()
    const rows = sqlite.getAllSync(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
      [SEARCH_TABLE],
    ) as { name: string }[]
    return rows.length > 0
  } catch {
    return false
  }
}

export const buildJournalSearchText = (input: {
  title: string
  body: string | null
  tagsJson: string
  category: string
}): string =>
  [input.title, input.body ?? '', input.tagsJson, input.category].join(' ').trim().toLowerCase()

export const JournalSearchRepository = {
  isAvailable(): boolean {
    return isSearchIndexAvailable()
  },

  searchEntryIds(search: string, limit = 200): string[] {
    const query = buildJournalSearchLikeClause(search)
    if (!query || !isSearchIndexAvailable()) return []

    const sqlite = getSqlite()
    const rows = sqlite.getAllSync(
      `
        SELECT entry_id
        FROM ${SEARCH_TABLE}
        WHERE ${query.clause}
        LIMIT ?
      `,
      [...query.params, limit],
    ) as { entry_id: string }[]

    return rows.map((row) => row.entry_id)
  },

  upsertEntry(input: {
    id: string
    title: string
    body: string | null
    tagsJson: string
    category: string
    isArchived: boolean
  }): void {
    if (!isSearchIndexAvailable()) return

    const sqlite = getSqlite()

    if (input.isArchived) {
      sqlite.runSync(`DELETE FROM ${SEARCH_TABLE} WHERE entry_id = ?`, [input.id])
      return
    }

    sqlite.runSync(
      `
        INSERT INTO ${SEARCH_TABLE} (entry_id, search_text)
        VALUES (?, ?)
        ON CONFLICT(entry_id) DO UPDATE SET search_text = excluded.search_text
      `,
      [input.id, buildJournalSearchText(input)],
    )
  },

  deleteEntry(entryId: string): void {
    if (!isSearchIndexAvailable()) return
    getSqlite().runSync(`DELETE FROM ${SEARCH_TABLE} WHERE entry_id = ?`, [entryId])
  },
}
