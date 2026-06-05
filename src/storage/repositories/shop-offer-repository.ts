import { eq } from 'drizzle-orm';

import type { ShopDailyOfferRecord } from '@/types/shop-offer';

import { getDb } from '../database/client';
import { shopDailyOffers } from '../database/schema';

const mapRow = (row: typeof shopDailyOffers.$inferSelect): ShopDailyOfferRecord => ({
  dateKey: row.dateKey,
  hasOffer: row.hasOffer,
  catalogOfferId: row.catalogOfferId,
  productKey: row.productKey,
  discountPercent: row.discountPercent,
  offerPrice: row.offerPrice,
  originalPrice: row.originalPrice,
  purchased: row.purchased,
  createdAt: row.createdAt,
});

export const ShopOfferRepository = {
  async findByDateKey(dateKey: string): Promise<ShopDailyOfferRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shopDailyOffers)
      .where(eq(shopDailyOffers.dateKey, dateKey))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async saveNoOffer(dateKey: string): Promise<ShopDailyOfferRecord> {
    const db = getDb();
    const createdAt = new Date().toISOString();

    const rows = await db
      .insert(shopDailyOffers)
      .values({
        dateKey,
        hasOffer: false,
        catalogOfferId: null,
        productKey: null,
        discountPercent: null,
        offerPrice: null,
        originalPrice: null,
        purchased: false,
        createdAt,
      })
      .onConflictDoUpdate({
        target: shopDailyOffers.dateKey,
        set: { createdAt },
      })
      .returning();

    return mapRow(rows[0]);
  },

  async saveOffer(
    record: Omit<ShopDailyOfferRecord, 'hasOffer' | 'purchased' | 'createdAt'> & {
      purchased?: boolean;
    },
  ): Promise<ShopDailyOfferRecord> {
    const db = getDb();
    const createdAt = new Date().toISOString();

    const rows = await db
      .insert(shopDailyOffers)
      .values({
        dateKey: record.dateKey,
        hasOffer: true,
        catalogOfferId: record.catalogOfferId,
        productKey: record.productKey,
        discountPercent: record.discountPercent,
        offerPrice: record.offerPrice,
        originalPrice: record.originalPrice,
        purchased: record.purchased ?? false,
        createdAt,
      })
      .onConflictDoUpdate({
        target: shopDailyOffers.dateKey,
        set: {
          hasOffer: true,
          catalogOfferId: record.catalogOfferId,
          productKey: record.productKey,
          discountPercent: record.discountPercent,
          offerPrice: record.offerPrice,
          originalPrice: record.originalPrice,
          purchased: record.purchased ?? false,
          createdAt,
        },
      })
      .returning();

    return mapRow(rows[0]);
  },

  async markPurchased(dateKey: string): Promise<void> {
    const db = getDb();
    await db
      .update(shopDailyOffers)
      .set({ purchased: true })
      .where(eq(shopDailyOffers.dateKey, dateKey));
  },
};
