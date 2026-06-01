import { getSqlite } from '@/storage/database/client';
import { DATABASE_NAME } from '@/storage/database/constants';
import type { BackupTableSnapshot, GameBackupFile, GameBackupMeta } from '@/types/backup';

import { BACKUP_APP_ID, BACKUP_FORMAT_VERSION, BACKUP_TABLE_NAMES } from '../constants/backup-tables';
import { buildBackupFileName, computeBackupChecksum } from '../utils/backup-checksum';

const tableExists = (tableName: string): boolean => {
  const sqlite = getSqlite();
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [tableName],
  ) as { name: string }[];

  return rows.length > 0;
};

export const snapshotAllTables = (): BackupTableSnapshot => {
  const sqlite = getSqlite();
  const snapshot: BackupTableSnapshot = {};

  for (const tableName of BACKUP_TABLE_NAMES) {
    if (!tableExists(tableName)) {
      snapshot[tableName] = [];
      continue;
    }

    const rows = sqlite.getAllSync(`SELECT * FROM "${tableName}"`) as Record<string, unknown>[];
    snapshot[tableName] = rows;
  }

  return snapshot;
};

const resolvePlayerMeta = (
  tables: BackupTableSnapshot,
): Pick<GameBackupMeta, 'playerName' | 'playerLevel'> => {
  const playerRow = tables.player[0];
  if (!playerRow) {
    return { playerName: null, playerLevel: null };
  }

  return {
    playerName: typeof playerRow.name === 'string' ? playerRow.name : null,
    playerLevel: typeof playerRow.level === 'number' ? playerRow.level : Number(playerRow.level) || null,
  };
};

export const buildGameBackupFile = (params: {
  appVersion: string;
  platform: string;
  exportedAt?: string;
}): GameBackupFile => {
  const tables = snapshotAllTables();
  const exportedAt = params.exportedAt ?? new Date().toISOString();
  const totalRows = BACKUP_TABLE_NAMES.reduce((sum, tableName) => sum + tables[tableName].length, 0);
  const checksum = computeBackupChecksum(tables);
  const playerMeta = resolvePlayerMeta(tables);

  const meta: GameBackupMeta = {
    formatVersion: BACKUP_FORMAT_VERSION,
    appId: BACKUP_APP_ID,
    appVersion: params.appVersion,
    exportedAt,
    platform: params.platform,
    databaseName: DATABASE_NAME,
    tableCount: BACKUP_TABLE_NAMES.length,
    totalRows,
    checksum,
    ...playerMeta,
  };

  return { meta, tables };
};

export const serializeBackupFile = (file: GameBackupFile): string =>
  JSON.stringify(file, null, 2);

export const createBackupFileName = (exportedAt: string): string => buildBackupFileName(exportedAt);
