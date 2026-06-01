import { asc, eq } from 'drizzle-orm';

import { wishlist } from '@/storage/database/schema';
import type { WishlistEntry } from '@/types/wishlist';

import { getDb } from '../database/client';

export const getWishlistEntries = async (): Promise<WishlistEntry[]> => {
  const db = getDb();
  const rows = await db.select().from(wishlist).orderBy(asc(wishlist.addedAt));
  return rows.map((row) => ({
    itemKey: row.itemKey,
    addedAt: row.addedAt,
  }));
};

export const addWishlistItem = async (itemKey: string): Promise<boolean> => {
  const db = getDb();
  const existing = await db.select().from(wishlist).where(eq(wishlist.itemKey, itemKey)).limit(1);
  if (existing.length > 0) return false;

  await db.insert(wishlist).values({
    itemKey,
    addedAt: new Date().toISOString(),
  });
  return true;
};

export const removeWishlistItem = async (itemKey: string): Promise<void> => {
  const db = getDb();
  await db.delete(wishlist).where(eq(wishlist.itemKey, itemKey));
};

export const isWishlisted = async (itemKey: string): Promise<boolean> => {
  const db = getDb();
  const rows = await db.select().from(wishlist).where(eq(wishlist.itemKey, itemKey)).limit(1);
  return rows.length > 0;
};
