import type { BackupValidationErrorReason, BackupValidationResult, GameBackupFile } from '@/types/backup';

import {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  BACKUP_MESSAGES,
  BACKUP_REQUIRED_DOMAINS,
  BACKUP_TABLE_NAMES,
} from '../constants/backup-tables';
import { gameBackupFileSchema, validateBackupTableKeys } from '../schemas/game-backup-schema';
import { computeBackupChecksum } from '../utils/backup-checksum';
import { buildBackupPreview } from '../utils/backup-preview';
import { migrateBackupFile } from './backup-migration-service';

const parseMajorVersion = (version: string): number => {
  const major = version.split('.')[0];
  const parsed = Number(major);
  return Number.isFinite(parsed) ? parsed : 0;
};

const invalid = (reason: BackupValidationErrorReason, message: string): BackupValidationResult => ({
  valid: false,
  reason,
  message,
});

const ensureRequiredDomains = (file: GameBackupFile): BackupValidationResult | null => {
  for (const tableNames of Object.values(BACKUP_REQUIRED_DOMAINS)) {
    for (const tableName of tableNames) {
      if (!Array.isArray(file.tables[tableName])) {
        return invalid('missing_required_tables', BACKUP_MESSAGES.importInvalidFile);
      }
    }
  }

  if (!file.tables.player.length) {
    return invalid('missing_player', BACKUP_MESSAGES.importMissingPlayer);
  }

  return null;
};

const normalizeTables = (
  tables: Record<string, Record<string, unknown>[]>,
): GameBackupFile['tables'] => {
  const normalized = {} as GameBackupFile['tables'];

  for (const tableName of BACKUP_TABLE_NAMES) {
    normalized[tableName] = tables[tableName] ?? [];
  }

  return normalized;
};

export const parseBackupJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw invalid('invalid_json', BACKUP_MESSAGES.importInvalidFile);
  }
};

export const validateBackupFile = (
  raw: unknown,
  currentAppVersion = '1.0.0',
): BackupValidationResult => {
  const parsed = gameBackupFileSchema.safeParse(raw);
  if (!parsed.success) {
    return invalid('invalid_structure', BACKUP_MESSAGES.importInvalidFile);
  }

  let file: GameBackupFile = {
    meta: parsed.data.meta,
    tables: parsed.data.tables as GameBackupFile['tables'],
  };

  if (!validateBackupTableKeys(file.tables)) {
    return invalid('invalid_structure', BACKUP_MESSAGES.importInvalidFile);
  }

  if (file.meta.appId !== BACKUP_APP_ID) {
    return invalid('incompatible_app_version', BACKUP_MESSAGES.importIncompatibleApp);
  }

  if (file.meta.formatVersion > BACKUP_FORMAT_VERSION) {
    return invalid('future_format_version', BACKUP_MESSAGES.importFutureVersion);
  }

  if (file.meta.formatVersion < BACKUP_FORMAT_VERSION) {
    try {
      file = migrateBackupFile(file);
    } catch {
      return invalid('unsupported_format_version', BACKUP_MESSAGES.importUnsupportedVersion);
    }
  }

  const currentMajor = parseMajorVersion(currentAppVersion);
  const backupMajor = parseMajorVersion(file.meta.appVersion);
  if (backupMajor > currentMajor) {
    return invalid('incompatible_app_version', BACKUP_MESSAGES.importFutureVersion);
  }

  const checksum = computeBackupChecksum(file.tables);
  if (checksum !== file.meta.checksum) {
    return invalid('checksum_mismatch', BACKUP_MESSAGES.importChecksumFailed);
  }

  file = {
    ...file,
    tables: normalizeTables(file.tables),
  };

  const domainError = ensureRequiredDomains(file);
  if (domainError) return domainError;

  if (file.meta.totalRows === 0) {
    return invalid('empty_backup', BACKUP_MESSAGES.importInvalidFile);
  }

  return {
    valid: true,
    file,
    preview: buildBackupPreview(file),
  };
};

export const validateBackupJson = (
  raw: string,
  currentAppVersion = '1.0.0',
): BackupValidationResult => {
  try {
    const parsed = parseBackupJson(raw);
    return validateBackupFile(parsed, currentAppVersion);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'valid' in error &&
      (error as BackupValidationResult).valid === false
    ) {
      return error as BackupValidationResult;
    }

    return invalid('invalid_json', BACKUP_MESSAGES.importInvalidFile);
  }
};
