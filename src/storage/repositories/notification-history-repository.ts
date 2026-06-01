import { and, desc, eq, gte, inArray } from 'drizzle-orm';

import {
  NotificationStatus,
  type NotificationCategoryValue,
  type NotificationHistoryRecord,
  type NotificationStatusValue,
} from '@/types/notification';

import { getDb } from '../database/client';
import { notificationHistory } from '../database/schema';

const mapRow = (row: typeof notificationHistory.$inferSelect): NotificationHistoryRecord => ({
  id: row.id,
  category: row.category as NotificationCategoryValue,
  title: row.title,
  body: row.body,
  status: row.status as NotificationStatusValue,
  identifier: row.identifier,
  scheduledFor: row.scheduledFor ?? null,
  deliveredAt: row.deliveredAt ?? null,
  openedAt: row.openedAt ?? null,
  createdAt: row.createdAt,
});

export const recordNotificationScheduled = async (input: {
  category: NotificationCategoryValue;
  title: string;
  body: string;
  identifier: string;
  scheduledFor: string;
}): Promise<void> => {
  const db = getDb();

  await db.insert(notificationHistory).values({
    category: input.category,
    title: input.title,
    body: input.body,
    status: NotificationStatus.SCHEDULED,
    identifier: input.identifier,
    scheduledFor: input.scheduledFor,
    createdAt: new Date().toISOString(),
  });
};

export const markNotificationDelivered = async (identifier: string): Promise<void> => {
  const db = getDb();
  const deliveredAt = new Date().toISOString();

  await db
    .update(notificationHistory)
    .set({ status: NotificationStatus.DELIVERED, deliveredAt })
    .where(eq(notificationHistory.identifier, identifier));
};

export const markNotificationOpened = async (identifier: string): Promise<void> => {
  const db = getDb();
  const openedAt = new Date().toISOString();

  await db
    .update(notificationHistory)
    .set({ status: NotificationStatus.OPENED, openedAt })
    .where(eq(notificationHistory.identifier, identifier));
};

export const getCategoriesSentToday = async (dayStartIso: string): Promise<NotificationCategoryValue[]> => {
  const db = getDb();
  const rows = await db
    .select({ category: notificationHistory.category })
    .from(notificationHistory)
    .where(
      and(
        gte(notificationHistory.createdAt, dayStartIso),
        inArray(notificationHistory.status, [
          NotificationStatus.SCHEDULED,
          NotificationStatus.DELIVERED,
          NotificationStatus.OPENED,
        ]),
      ),
    );

  return [...new Set(rows.map((row) => row.category as NotificationCategoryValue))];
};

export const getRecentNotificationHistory = async (limit = 10): Promise<NotificationHistoryRecord[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(notificationHistory)
    .orderBy(desc(notificationHistory.createdAt))
    .limit(limit);

  return rows.map(mapRow);
};

export const countNotificationsSentToday = async (dayStartIso: string): Promise<number> => {
  const db = getDb();
  const rows = await db
    .select({ id: notificationHistory.id })
    .from(notificationHistory)
    .where(
      and(
        gte(notificationHistory.createdAt, dayStartIso),
        inArray(notificationHistory.status, [
          NotificationStatus.SCHEDULED,
          NotificationStatus.DELIVERED,
          NotificationStatus.OPENED,
        ]),
      ),
    );

  return rows.length;
};
