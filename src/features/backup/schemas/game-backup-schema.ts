import { z } from 'zod';

import { BACKUP_TABLE_NAMES } from '../constants/backup-tables';

const backupRowSchema = z.record(z.string(), z.unknown());

const backupTableSnapshotSchema = z.record(z.string(), z.array(backupRowSchema));

export const gameBackupMetaSchema = z.object({
  formatVersion: z.number().int().positive(),
  appId: z.string().min(1),
  appVersion: z.string().min(1),
  exportedAt: z.string().min(1),
  platform: z.string(),
  databaseName: z.string(),
  tableCount: z.number().int().nonnegative(),
  totalRows: z.number().int().nonnegative(),
  checksum: z.string().regex(/^[0-9a-f]{8}$/i),
  playerName: z.string().nullable(),
  playerLevel: z.number().nullable(),
});

export const gameBackupFileSchema = z.object({
  meta: gameBackupMetaSchema,
  tables: backupTableSnapshotSchema,
});

export type ParsedGameBackupFile = z.infer<typeof gameBackupFileSchema>;

export const validateBackupTableKeys = (
  tables: Record<string, unknown[]>,
): tables is Record<string, Record<string, unknown>[]> => {
  for (const value of Object.values(tables)) {
    if (!Array.isArray(value)) return false;
  }

  return true;
};
