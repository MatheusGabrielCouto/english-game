import { getSqlite } from '@/storage/database/client';
import type { GameBackupFile } from '@/types/backup';

import { BACKUP_TABLE_NAMES } from '../constants/backup-tables';

type SqliteDatabase = ReturnType<typeof getSqlite>;

const tableExists = (sqlite: SqliteDatabase, tableName: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    tableName,
  ) as { name: string }[];

  return rows.length > 0;
};

const getTableColumns = (sqlite: SqliteDatabase, tableName: string): Set<string> => {
  const rows = sqlite.getAllSync(`PRAGMA table_info("${tableName}")`) as { name: string }[];
  return new Set(rows.map((row) => row.name));
};

const insertRow = (
  sqlite: SqliteDatabase,
  tableName: string,
  row: Record<string, unknown>,
  tableColumns: Set<string>,
): void => {
  const columns = Object.keys(row).filter((column) => tableColumns.has(column));
  if (columns.length === 0) return;

  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT INTO "${tableName}" (${columns.map((column) => `"${column}"`).join(', ')}) VALUES (${placeholders})`;
  const values = columns.map((column) => {
    const value = row[column];
    if (value === undefined) return null;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return value as string | number | null;
  });

  sqlite.runSync(sql, values);
};

export const restoreBackupTables = (file: GameBackupFile): void => {
  const sqlite = getSqlite();

  sqlite.withTransactionSync(() => {
    sqlite.execSync('PRAGMA foreign_keys = OFF');

    for (const tableName of BACKUP_TABLE_NAMES) {
      if (!tableExists(sqlite, tableName)) continue;

      sqlite.execSync(`DELETE FROM "${tableName}"`);

      const rows = file.tables[tableName] ?? [];
      if (rows.length === 0) continue;

      const tableColumns = getTableColumns(sqlite, tableName);

      for (const row of rows) {
        insertRow(sqlite, tableName, row, tableColumns);
      }
    }

    sqlite.execSync('PRAGMA foreign_keys = ON');
  });
};
