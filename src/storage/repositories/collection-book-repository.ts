import { eq } from 'drizzle-orm';

import { collectionBook } from '@/storage/database/schema';
import type { CollectionBookEntry } from '@/types/collectible';

import { getDb } from '../database/client';

export const getCollectionBookEntries = async (): Promise<CollectionBookEntry[]> => {
  const db = getDb();
  const rows = await db.select().from(collectionBook);
  return rows.map((row) => ({
    itemKey: row.itemKey,
    category: row.category as CollectionBookEntry['category'],
    rarity: row.rarity as CollectionBookEntry['rarity'],
    discoveredAt: row.discoveredAt,
  }));
};

export const discoverCollectionItem = async (
  itemKey: string,
  category: CollectionBookEntry['category'],
  rarity: CollectionBookEntry['rarity'],
): Promise<boolean> => {
  const db = getDb();
  const existing = await db
    .select()
    .from(collectionBook)
    .where(eq(collectionBook.itemKey, itemKey))
    .limit(1);

  if (existing.length > 0) return false;

  await db.insert(collectionBook).values({
    itemKey,
    category,
    rarity,
    discoveredAt: new Date().toISOString(),
  });

  return true;
};

export const hasCollectionItem = async (itemKey: string): Promise<boolean> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(collectionBook)
    .where(eq(collectionBook.itemKey, itemKey))
    .limit(1);
  return rows.length > 0;
};

export const getCollectionCountByCategory = async (): Promise<Record<string, number>> => {
  const entries = await getCollectionBookEntries();
  return entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + 1;
    return acc;
  }, {});
};
