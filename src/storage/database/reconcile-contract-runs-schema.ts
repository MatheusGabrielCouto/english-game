import type { SQLiteDatabase } from 'expo-sqlite';

const columnExists = (
  sqlite: SQLiteDatabase,
  table: string,
  column: string,
): boolean => {
  const rows = sqlite.getAllSync(`PRAGMA table_info(${table})`) as { name: string }[];
  return rows.some((row) => row.name === column);
};

export const reconcileContractRunsSchema = (sqlite: SQLiteDatabase): void => {
  if (!columnExists(sqlite, 'contract_runs', 'issuer_poi_key')) {
    sqlite.execSync(`ALTER TABLE contract_runs ADD COLUMN issuer_poi_key text`);
  }
};
