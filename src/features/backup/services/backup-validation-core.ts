import type { BackupValidationErrorReason, BackupValidationResult, GameBackupFile } from '@/types/backup'

import {
    BACKUP_APP_ID,
    BACKUP_FORMAT_VERSION,
    BACKUP_MESSAGES,
    BACKUP_REQUIRED_DOMAINS
} from '../constants/backup-tables'
import { gameBackupFileSchema, validateBackupTableKeys } from '../schemas/game-backup-schema'
import { computeBackupFileChecksum, DEFAULT_BACKUP_PREFERENCES } from '../utils/backup-payload'
import { buildBackupPreview } from '../utils/backup-preview'
import { migrateBackupFile } from './backup-migration-service'

const parseMajorVersion = (version: string): number => {
  const major = version.split('.')[0]
  const parsed = Number(major)
  return Number.isFinite(parsed) ? parsed : 0
}

const invalid = (reason: BackupValidationErrorReason, message: string): BackupValidationResult => ({
  valid: false,
  reason,
  message,
})

const ensureRequiredDomains = (file: GameBackupFile): BackupValidationResult | null => {
  for (const tableNames of Object.values(BACKUP_REQUIRED_DOMAINS)) {
    for (const tableName of tableNames) {
      if (!Array.isArray(file.tables[tableName])) {
        return invalid('missing_required_tables', BACKUP_MESSAGES.importInvalidFile)
      }
    }
  }

  if (!file.tables.player.length) {
    return invalid('missing_player', BACKUP_MESSAGES.importMissingPlayer)
  }

  return null
}

const normalizeFile = (raw: GameBackupFile): GameBackupFile => {
  const migrated = migrateBackupFile({
    ...raw,
    preferences: raw.preferences ?? DEFAULT_BACKUP_PREFERENCES,
  })

  return migrated
}

export const parseBackupJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw invalid('invalid_json', BACKUP_MESSAGES.importInvalidFile)
  }
}

export const validateBackupFile = (
  raw: unknown,
  currentAppVersion = '1.0.0',
): BackupValidationResult => {
  const parsed = gameBackupFileSchema.safeParse(raw)
  if (!parsed.success) {
    return invalid('invalid_structure', BACKUP_MESSAGES.importInvalidFile)
  }

  let file = normalizeFile({
    meta: parsed.data.meta,
    tables: parsed.data.tables as GameBackupFile['tables'],
    preferences: parsed.data.preferences ?? DEFAULT_BACKUP_PREFERENCES,
  })

  if (!validateBackupTableKeys(file.tables)) {
    return invalid('invalid_structure', BACKUP_MESSAGES.importInvalidFile)
  }

  if (file.meta.appId !== BACKUP_APP_ID) {
    return invalid('incompatible_app_version', BACKUP_MESSAGES.importIncompatibleApp)
  }

  if (file.meta.formatVersion > BACKUP_FORMAT_VERSION) {
    return invalid('future_format_version', BACKUP_MESSAGES.importFutureVersion)
  }

  if (parsed.data.meta.formatVersion < BACKUP_FORMAT_VERSION) {
    try {
      file = normalizeFile(file)
    } catch {
      return invalid('unsupported_format_version', BACKUP_MESSAGES.importUnsupportedVersion)
    }
  }

  const currentMajor = parseMajorVersion(currentAppVersion)
  const backupMajor = parseMajorVersion(file.meta.appVersion)
  if (backupMajor > currentMajor) {
    return invalid('incompatible_app_version', BACKUP_MESSAGES.importFutureVersion)
  }

  const checksum = computeBackupFileChecksum(file.tables, file.preferences)
  if (checksum !== file.meta.checksum) {
    return invalid('checksum_mismatch', BACKUP_MESSAGES.importChecksumFailed)
  }

  const domainError = ensureRequiredDomains(file)
  if (domainError) return domainError

  if (file.meta.totalRows === 0) {
    return invalid('empty_backup', BACKUP_MESSAGES.importInvalidFile)
  }

  return {
    valid: true,
    file,
    preview: buildBackupPreview(file),
  }
}

export const validateBackupJson = (
  raw: string,
  currentAppVersion = '1.0.0',
): BackupValidationResult => {
  try {
    const parsed = parseBackupJson(raw)
    return validateBackupFile(parsed, currentAppVersion)
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'valid' in error &&
      (error as BackupValidationResult).valid === false
    ) {
      return error as BackupValidationResult
    }

    return invalid('invalid_json', BACKUP_MESSAGES.importInvalidFile)
  }
}
