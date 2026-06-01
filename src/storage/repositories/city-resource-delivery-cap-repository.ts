import { and, eq } from 'drizzle-orm';

import type { CityResourceTypeValue } from '@/types/city-resource';

import { getDb } from '../database/client';
import { cityResourceDeliveryCaps } from '../database/schema';

export const CityResourceDeliveryCapRepository = {
  async getDeliveredToday(
    resourceType: CityResourceTypeValue,
    deliveryDate: string,
  ): Promise<number> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityResourceDeliveryCaps)
      .where(
        and(
          eq(cityResourceDeliveryCaps.resourceType, resourceType),
          eq(cityResourceDeliveryCaps.deliveryDate, deliveryDate),
        ),
      )
      .limit(1);

    return rows[0]?.amount ?? 0;
  },

  async addDelivered(
    resourceType: CityResourceTypeValue,
    deliveryDate: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) return;

    const db = getDb();
    const current = await CityResourceDeliveryCapRepository.getDeliveredToday(
      resourceType,
      deliveryDate,
    );
    const next = current + amount;

    await db
      .insert(cityResourceDeliveryCaps)
      .values({ resourceType, deliveryDate, amount: next })
      .onConflictDoUpdate({
        target: [cityResourceDeliveryCaps.resourceType, cityResourceDeliveryCaps.deliveryDate],
        set: { amount: next },
      });
  },
};
