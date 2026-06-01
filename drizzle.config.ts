import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/storage/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
