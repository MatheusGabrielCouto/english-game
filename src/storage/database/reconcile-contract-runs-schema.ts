import type { SQLiteDatabase } from 'expo-sqlite'

import { ensureMigrationApplied } from './resilient-migrator'

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[]

  return rows.length > 0
}

const columnExists = (
  sqlite: SQLiteDatabase,
  table: string,
  column: string,
): boolean => {
  const rows = sqlite.getAllSync(`PRAGMA table_info(${table})`) as { name: string }[]
  return rows.some((row) => row.name === column)
}

export const reconcileContractRunsSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'contract_runs')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS contract_runs (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        contract_key text NOT NULL,
        status text NOT NULL,
        target_days integer NOT NULL,
        progress_days integer NOT NULL,
        stake_amount integer NOT NULL,
        started_at text NOT NULL,
        ended_at text,
        last_progress_at text,
        issuer_poi_key text
      )
    `)
  } else if (!columnExists(sqlite, 'contract_runs', 'issuer_poi_key')) {
    sqlite.execSync(`ALTER TABLE contract_runs ADD COLUMN issuer_poi_key text`)
  }

  if (!tableExists(sqlite, 'contract_analytics')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS contract_analytics (
        id integer PRIMARY KEY NOT NULL,
        total_accepted integer DEFAULT 0 NOT NULL,
        total_completed integer DEFAULT 0 NOT NULL,
        total_failed integer DEFAULT 0 NOT NULL,
        total_coins_staked integer DEFAULT 0 NOT NULL,
        total_coins_won integer DEFAULT 0 NOT NULL,
        total_coins_lost integer DEFAULT 0 NOT NULL,
        total_shields_granted integer DEFAULT 0 NOT NULL,
        total_loot_boxes_granted integer DEFAULT 0 NOT NULL,
        largest_contract_completed_key text,
        last_contract_at text
      )
    `)
    sqlite.execSync(`
      INSERT OR IGNORE INTO contract_analytics (
        id,
        total_accepted,
        total_completed,
        total_failed,
        total_coins_staked,
        total_coins_won,
        total_coins_lost,
        total_shields_granted,
        total_loot_boxes_granted
      )
      VALUES (1, 0, 0, 0, 0, 0, 0, 0, 0)
    `)
  }

  ensureMigrationApplied(sqlite, '0012_contracts_system')
  ensureMigrationApplied(sqlite, '0027_contract_issuer_poi')
}
