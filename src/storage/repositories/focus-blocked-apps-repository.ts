import { eq } from 'drizzle-orm';

import { DEFAULT_BLOCKED_APPS } from '@/features/focus-mode/constants/default-blocked-apps';
import type { FocusBlockedApp } from '@/types/focus-mode';

import { getDb } from '../database/client';
import { focusBlockedApps } from '../database/schema';

const mapRow = (row: typeof focusBlockedApps.$inferSelect): FocusBlockedApp => ({
  packageName: row.packageName,
  label: row.label,
  category: row.category as FocusBlockedApp['category'],
  enabled: row.enabled,
  isDefault: row.isDefault,
});

export const seedDefaultBlockedApps = async (): Promise<void> => {
  const db = getDb();
  const existing = await db.select({ packageName: focusBlockedApps.packageName }).from(focusBlockedApps);
  const existingSet = new Set(existing.map((row) => row.packageName));

  for (const app of DEFAULT_BLOCKED_APPS) {
    if (existingSet.has(app.packageName)) continue;
    await db.insert(focusBlockedApps).values({
      packageName: app.packageName,
      label: app.label,
      category: app.category,
      enabled: true,
      isDefault: app.isDefault,
    });
  }
};

export const getFocusBlockedApps = async (): Promise<FocusBlockedApp[]> => {
  const db = getDb();
  const rows = await db.select().from(focusBlockedApps);
  return rows.map(mapRow);
};

export const getEnabledBlockedPackageNames = async (): Promise<string[]> => {
  const apps = await getFocusBlockedApps();
  return apps.filter((app) => app.enabled).map((app) => app.packageName);
};

export const setBlockedAppEnabled = async (packageName: string, enabled: boolean): Promise<void> => {
  const db = getDb();
  await db.update(focusBlockedApps).set({ enabled }).where(eq(focusBlockedApps.packageName, packageName));
};

export const upsertBlockedApp = async (app: FocusBlockedApp): Promise<void> => {
  const db = getDb();
  await db
    .insert(focusBlockedApps)
    .values({
      packageName: app.packageName,
      label: app.label,
      category: app.category,
      enabled: app.enabled,
      isDefault: app.isDefault,
    })
    .onConflictDoUpdate({
      target: focusBlockedApps.packageName,
      set: {
        label: app.label,
        category: app.category,
        enabled: app.enabled,
      },
    });
};
