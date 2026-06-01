const BENIGN_ERROR =
  /already exists|duplicate column name|UNIQUE constraint failed|duplicate key/i;

export type ResilientMigratorSqlite = {
  execSync: (sql: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllSync: (sql: string, ...params: any[]) => unknown[];
};

export type MigrationEntry = {
  tag: string;
  sql: string;
};

const ensureMigrationsTable = (sqlite: ResilientMigratorSqlite): void => {
  sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      hash text NOT NULL,
      created_at integer
    )
  `);
};

const isMigrationApplied = (sqlite: ResilientMigratorSqlite, tag: string): boolean => {
  const rows = sqlite.getAllSync(
    `SELECT id FROM __drizzle_migrations WHERE hash = ?`,
    tag,
  ) as { id: number }[];

  return rows.length > 0;
};

const markMigrationApplied = (sqlite: ResilientMigratorSqlite, tag: string): void => {
  if (isMigrationApplied(sqlite, tag)) return;
  sqlite.execSync(
    `INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('${tag.replace(/'/g, "''")}', ${Date.now()})`,
  );
};

/** Marks a migration as applied when schema repairs already reflect its outcome. */
export const ensureMigrationApplied = (
  sqlite: ResilientMigratorSqlite,
  tag: string,
): void => {
  ensureMigrationsTable(sqlite);
  markMigrationApplied(sqlite, tag);
};

const runStatement = (sqlite: ResilientMigratorSqlite, statement: string): void => {
  try {
    sqlite.execSync(statement);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (BENIGN_ERROR.test(message)) return;
    throw error;
  }
};

const splitStatements = (sql: string): string[] =>
  sql
    .split('--> statement-breakpoint')
    .map((part) => part.trim())
    .filter(Boolean);

export const runResilientMigrations = (
  sqlite: ResilientMigratorSqlite,
  entries: MigrationEntry[],
): { applied: number; skipped: number } => {
  ensureMigrationsTable(sqlite);

  let applied = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (isMigrationApplied(sqlite, entry.tag)) {
      skipped += 1;
      continue;
    }

    for (const statement of splitStatements(entry.sql)) {
      runStatement(sqlite, statement);
    }

    markMigrationApplied(sqlite, entry.tag);
    applied += 1;
  }

  return { applied, skipped };
};

export const buildMigrationEntriesFromBundle = (bundle: {
  journal: { entries: { idx: number; tag: string }[] };
  migrations: Record<string, string>;
}): MigrationEntry[] =>
  bundle.journal.entries.map((entry) => {
    const key = `m${String(entry.idx).padStart(4, '0')}`;
    const sql = bundle.migrations[key];
    if (!sql) {
      throw new Error(`Missing migration SQL for ${entry.tag} (${key})`);
    }
    return { tag: entry.tag, sql };
  });
