import type { SQLiteDatabase } from 'expo-sqlite'

/**
 * Tunes SQLite for mobile read-heavy workloads (journal, routines, flash decks).
 * Safe defaults for expo-sqlite on iOS/Android.
 */
export const applySqlitePerformancePragmas = (sqlite: SQLiteDatabase): void => {
  sqlite.execSync('PRAGMA journal_mode = WAL;')
  sqlite.execSync('PRAGMA synchronous = NORMAL;')
  sqlite.execSync('PRAGMA temp_store = MEMORY;')
  // Negative value = KiB pages; ~8 MB page cache.
  sqlite.execSync('PRAGMA cache_size = -8000;')
  sqlite.execSync('PRAGMA foreign_keys = ON;')
}
