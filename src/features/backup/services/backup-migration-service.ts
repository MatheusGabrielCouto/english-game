import type { GameBackupFile } from '@/types/backup'

import { BACKUP_FORMAT_VERSION, BACKUP_TABLE_NAMES } from '../constants/backup-tables'
import { computeBackupFileChecksum, DEFAULT_BACKUP_PREFERENCES } from '../utils/backup-payload'

const countRows = (tables: GameBackupFile['tables'], preferences: GameBackupFile['preferences']): number => {
  const tableRows = BACKUP_TABLE_NAMES.reduce(
    (sum, tableName) => sum + (tables[tableName]?.length ?? 0),
    0,
  )

  return tableRows + preferences.menuHubPinnedIds.length
}

const normalizeTables = (
  tables: Record<string, Record<string, unknown>[]>,
): GameBackupFile['tables'] => {
  const normalized = {} as GameBackupFile['tables']

  for (const tableName of BACKUP_TABLE_NAMES) {
    normalized[tableName] = tables[tableName] ?? []
  }

  return normalized
}

const migrateV1ToV2 = (file: GameBackupFile): GameBackupFile => {
  const tables = normalizeTables(file.tables)
  const preferences = file.preferences ?? DEFAULT_BACKUP_PREFERENCES

  return {
    meta: {
      ...file.meta,
      formatVersion: BACKUP_FORMAT_VERSION,
      tableCount: BACKUP_TABLE_NAMES.length,
      totalRows: countRows(tables, preferences),
      checksum: computeBackupFileChecksum(tables, preferences),
    },
    tables,
    preferences,
  }
}

/**
 * Upgrades legacy backup payloads to the current format.
 */
export const migrateBackupFile = (file: GameBackupFile): GameBackupFile => {
  if (file.meta.formatVersion === BACKUP_FORMAT_VERSION) {
    return {
      ...file,
      tables: normalizeTables(file.tables),
      preferences: file.preferences ?? DEFAULT_BACKUP_PREFERENCES,
    }
  }

  if (file.meta.formatVersion === 1) {
    return migrateV1ToV2({
      ...file,
      preferences: file.preferences ?? DEFAULT_BACKUP_PREFERENCES,
    })
  }

  if (file.meta.formatVersion > BACKUP_FORMAT_VERSION) {
    return file
  }

  throw new Error(`Unsupported backup format version: ${file.meta.formatVersion}`)
}
