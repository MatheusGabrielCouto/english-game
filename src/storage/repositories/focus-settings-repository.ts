import { eq } from 'drizzle-orm';

import type { FocusSettings } from '@/types/focus-mode';

import { getDb } from '../database/client';
import { focusSettings } from '../database/schema';

const mapRow = (row: typeof focusSettings.$inferSelect): FocusSettings => ({
  enabled: row.enabled,
  defaultDurationMinutes: row.defaultDurationMinutes,
  hardcoreMode: row.hardcoreMode,
  monitoringEnabled: row.monitoringEnabled,
  accessibilityDisclosureAccepted: row.accessibilityDisclosureAccepted,
  updatedAt: row.updatedAt,
});

export const getOrCreateFocusSettings = async (): Promise<FocusSettings> => {
  const db = getDb();
  const rows = await db.select().from(focusSettings).where(eq(focusSettings.id, 1)).limit(1);

  if (rows[0]) return mapRow(rows[0]);

  const now = new Date().toISOString();
  await db.insert(focusSettings).values({
    id: 1,
    enabled: true,
    defaultDurationMinutes: 30,
    hardcoreMode: false,
    monitoringEnabled: true,
    accessibilityDisclosureAccepted: false,
    updatedAt: now,
  });

  return {
    enabled: true,
    defaultDurationMinutes: 30,
    hardcoreMode: false,
    monitoringEnabled: true,
    accessibilityDisclosureAccepted: false,
    updatedAt: now,
  };
};

export const saveFocusSettings = async (settings: FocusSettings): Promise<void> => {
  const db = getDb();
  await db
    .update(focusSettings)
    .set({
      enabled: settings.enabled,
      defaultDurationMinutes: settings.defaultDurationMinutes,
      hardcoreMode: settings.hardcoreMode,
      monitoringEnabled: settings.monitoringEnabled,
      accessibilityDisclosureAccepted: settings.accessibilityDisclosureAccepted,
      updatedAt: settings.updatedAt,
    })
    .where(eq(focusSettings.id, 1));
};
