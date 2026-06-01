import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import migrations from '../../../drizzle/migrations';

import { DATABASE_NAME } from './constants';
import { reconcileCareerMetagameSchema } from './reconcile-career-metagame-schema';
import { reconcileCityEventsSchema } from './reconcile-city-events-schema';
import { reconcileCityPolishSchema } from './reconcile-city-polish-schema';
import { reconcileContractRunsSchema } from './reconcile-contract-runs-schema';
import { reconcileFocusModeSchema } from './reconcile-focus-mode-schema';
import { reconcileGameDesignSchema } from './reconcile-game-design-schema';
import { reconcileLearningSystemsSchema } from './reconcile-learning-systems-schema';
import { reconcileLivingCitySchema } from './reconcile-living-city-schema';
import { reconcileMemoryWallSchema } from './reconcile-memory-wall-schema';
import { reconcileNotificationsSchema } from './reconcile-notifications-schema';
import { reconcileWeeklyMissionsSchema } from './reconcile-weekly-missions-schema';
import {
    buildMigrationEntriesFromBundle,
    runResilientMigrations,
} from './resilient-migrator';
import { schema } from './schema';

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

type SqliteDatabase = ReturnType<typeof openDatabaseSync>;

let database: AppDatabase | null = null;
let sqliteInstance: SqliteDatabase | null = null;
let initPromise: Promise<AppDatabase> | null = null;

const repairSchema = (sqlite: ReturnType<typeof openDatabaseSync>): void => {
  reconcileWeeklyMissionsSchema(sqlite);
  reconcileGameDesignSchema(sqlite);
  reconcileCareerMetagameSchema(sqlite);
  reconcileFocusModeSchema(sqlite);
  reconcileNotificationsSchema(sqlite);
  reconcileLivingCitySchema(sqlite);
  reconcileCityEventsSchema(sqlite);
  reconcileCityPolishSchema(sqlite);
  reconcileMemoryWallSchema(sqlite);
  reconcileLearningSystemsSchema(sqlite);
  reconcileContractRunsSchema(sqlite);
};

export const getDb = (): AppDatabase => {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
};

export const getSqlite = (): SqliteDatabase => {
  if (!sqliteInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return sqliteInstance;
};

export const initDatabase = async (): Promise<AppDatabase> => {
  if (database) return database;

  if (!initPromise) {
    initPromise = (async () => {
      const sqlite = openDatabaseSync(DATABASE_NAME, {
        enableChangeListener: true,
      });

      // Run idempotent repairs first — journal idx bugs can skip migrations entirely.
      repairSchema(sqlite);

      const db = drizzle(sqlite, { schema });

      const migrationEntries = buildMigrationEntriesFromBundle(migrations);
      runResilientMigrations(sqlite, migrationEntries);

      repairSchema(sqlite);
      sqliteInstance = sqlite;
      database = db;
      return db;
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
};
