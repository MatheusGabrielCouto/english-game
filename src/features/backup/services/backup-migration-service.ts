import type { GameBackupFile } from '@/types/backup';

import { BACKUP_FORMAT_VERSION } from '../constants/backup-tables';

/**
 * Upgrades legacy backup payloads to the current format.
 * v1 is the only supported version today — hook for future migrations.
 */
export const migrateBackupFile = (file: GameBackupFile): GameBackupFile => {
  if (file.meta.formatVersion === BACKUP_FORMAT_VERSION) {
    return file;
  }

  if (file.meta.formatVersion > BACKUP_FORMAT_VERSION) {
    return file;
  }

  throw new Error(`Unsupported backup format version: ${file.meta.formatVersion}`);
};
