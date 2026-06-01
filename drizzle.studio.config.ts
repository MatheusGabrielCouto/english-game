import { defineConfig } from 'drizzle-kit';

/**
 * Config para Drizzle Studio no computador (SQLite local em .data/).
 * O app Expo usa drizzle.config.ts (driver: expo) + migrations no dispositivo.
 */
export default defineConfig({
  schema: './src/storage/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './.data/english-quest-dev.db',
  },
});
