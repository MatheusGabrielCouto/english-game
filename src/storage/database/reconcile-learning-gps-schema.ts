import type { SQLiteDatabase } from 'expo-sqlite'

import { ensureMigrationApplied } from './resilient-migrator'

const tableExists = (sqlite: SQLiteDatabase, table: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  ) as { name: string }[]

  return rows.length > 0
}

const seedWorlds = (sqlite: SQLiteDatabase): void => {
  sqlite.execSync(`
    INSERT OR IGNORE INTO learning_worlds (
      key, name, emoji, cefr_level, sort_order,
      estimated_days_min, estimated_days_max, goal_description, description
    ) VALUES
      ('survivor', 'Survivor', '🏕️', 'A1', 1, 30, 60,
       'Manter uma conversa de 2 minutos',
       'Sobreviver em inglês básico — apresentações, números, rotina simples.'),
      ('explorer', 'Explorer', '🧭', 'A2', 2, 60, 90,
       'Manter uma conversa de 5 minutos',
       'Viagens, compras, restaurantes e conversas do cotidiano.'),
      ('professional', 'Professional', '💼', 'B1', 3, 90, 120,
       'Participar de reuniões simples',
       'Trabalho, tecnologia e comunicação profissional inicial.'),
      ('developer', 'Developer', '💻', 'B2', 4, 120, 180,
       'Trabalhar em ambiente internacional',
       'Programação, documentação técnica e mensagens profissionais.'),
      ('global_engineer', 'Global Engineer', '🛰️', 'C1', 5, 180, 360,
       'Ser contratado internacionalmente',
       'Fluência profissional, entrevistas e liderança técnica.'),
      ('legend', 'Legend', '👑', 'C2', 6, 365, 730,
       'Domínio avançado do idioma',
       'Debates, apresentações, negociação e ensino.')
  `)
}

const seedProfileAndSkills = (sqlite: SQLiteDatabase): void => {
  sqlite.execSync(`
    INSERT OR IGNORE INTO player_learning_profile (
      id, current_world_key, world_progress, learning_gps_onboarded, updated_at
    ) VALUES (1, 'survivor', 0, 0, datetime('now'))
  `)

  sqlite.execSync(`
    INSERT OR IGNORE INTO skill_levels (skill_key, level, updated_at) VALUES
      ('vocabulary', 0, datetime('now')),
      ('reading', 0, datetime('now')),
      ('listening', 0, datetime('now')),
      ('speaking', 0, datetime('now')),
      ('writing', 0, datetime('now')),
      ('grammar', 0, datetime('now'))
  `)
}

export const reconcileLearningGpsSchema = (sqlite: SQLiteDatabase): void => {
  if (!tableExists(sqlite, 'learning_worlds')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS learning_worlds (
        key text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        emoji text NOT NULL,
        cefr_level text NOT NULL,
        sort_order integer NOT NULL,
        estimated_days_min integer NOT NULL,
        estimated_days_max integer NOT NULL,
        goal_description text NOT NULL,
        description text
      )
    `)
  }

  if (!tableExists(sqlite, 'player_learning_profile')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS player_learning_profile (
        id integer PRIMARY KEY NOT NULL,
        current_world_key text NOT NULL,
        world_progress integer DEFAULT 0 NOT NULL,
        learning_gps_onboarded integer DEFAULT 0 NOT NULL,
        onboarded_at text,
        updated_at text NOT NULL
      )
    `)
  }

  if (!tableExists(sqlite, 'skill_levels')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS skill_levels (
        skill_key text PRIMARY KEY NOT NULL,
        level integer DEFAULT 0 NOT NULL,
        updated_at text NOT NULL
      )
    `)
  }

  if (!tableExists(sqlite, 'learning_daily_plans')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS learning_daily_plans (
        date_key text PRIMARY KEY NOT NULL,
        difficulty text NOT NULL,
        block_progress_json text NOT NULL DEFAULT '{}',
        updated_at text NOT NULL
      )
    `)
  }

  seedWorlds(sqlite)
  seedProfileAndSkills(sqlite)
  ensureMigrationApplied(sqlite, '0043_learning_gps')
  if (!tableExists(sqlite, 'learning_unit_progress')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS learning_unit_progress (
        unit_key text PRIMARY KEY NOT NULL,
        world_key text NOT NULL,
        status text NOT NULL DEFAULT 'locked',
        practice_progress integer NOT NULL DEFAULT 0,
        completed_at text,
        updated_at text NOT NULL
      )
    `)
    sqlite.execSync(`
      CREATE INDEX IF NOT EXISTS idx_learning_unit_progress_world ON learning_unit_progress (world_key)
    `)
  }

  ensureMigrationApplied(sqlite, '0044_learning_gps_daily_plan')
  ensureMigrationApplied(sqlite, '0045_learning_unit_progress')

  if (!tableExists(sqlite, 'learning_monthly_reports')) {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS learning_monthly_reports (
        month_key text PRIMARY KEY NOT NULL,
        generated_at text NOT NULL,
        report_json text NOT NULL,
        updated_at text NOT NULL
      )
    `)
  }

  ensureMigrationApplied(sqlite, '0046_learning_monthly_reports')
}
