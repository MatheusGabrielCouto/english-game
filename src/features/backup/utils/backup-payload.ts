import type { BackupPreferencesSnapshot, BackupTableSnapshot } from '@/types/backup'

import { computeBackupChecksum } from './backup-checksum'

export const DEFAULT_BACKUP_PREFERENCES: BackupPreferencesSnapshot = {
  menuHubPinnedIds: [],
}

export type BackupChecksumPayload = {
  tables: BackupTableSnapshot
  preferences: BackupPreferencesSnapshot
}

export const buildBackupChecksumPayload = (
  tables: BackupTableSnapshot,
  preferences?: BackupPreferencesSnapshot,
): BackupChecksumPayload => ({
  tables,
  preferences: preferences ?? DEFAULT_BACKUP_PREFERENCES,
})

export const computeBackupFileChecksum = (
  tables: BackupTableSnapshot,
  preferences?: BackupPreferencesSnapshot,
): string => computeBackupChecksum(buildBackupChecksumPayload(tables, preferences))
