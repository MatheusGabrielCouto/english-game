import { eq } from 'drizzle-orm';

import { CityResourceType, type CityResourceBalances, type CityResourceTypeValue } from '@/types/city-resource';

import { getDb } from '../database/client';
import { cityResources } from '../database/schema';

const ALL_TYPES = Object.values(CityResourceType);

const emptyBalances = (): CityResourceBalances => ({
  [CityResourceType.LEXICON_BRICK]: 0,
  [CityResourceType.FLUENCY_CEMENT]: 0,
  [CityResourceType.CONSISTENCY_WOOD]: 0,
});

export const CityResourceRepository = {
  async ensureSeeded(): Promise<void> {
    const db = getDb();
    for (const resourceType of ALL_TYPES) {
      await db
        .insert(cityResources)
        .values({ resourceType, balance: 0 })
        .onConflictDoNothing();
    }
  },

  async getBalances(): Promise<CityResourceBalances> {
    const db = getDb();
    const rows = await db.select().from(cityResources);
    const balances = emptyBalances();

    for (const row of rows) {
      const key = row.resourceType as CityResourceTypeValue;
      if (key in balances) {
        balances[key] = row.balance;
      }
    }

    return balances;
  },

  async getBalance(resourceType: CityResourceTypeValue): Promise<number> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityResources)
      .where(eq(cityResources.resourceType, resourceType))
      .limit(1);

    return rows[0]?.balance ?? 0;
  },

  async add(resourceType: CityResourceTypeValue, amount: number): Promise<number> {
    if (amount <= 0) return CityResourceRepository.getBalance(resourceType);

    await CityResourceRepository.ensureSeeded();
    const current = await CityResourceRepository.getBalance(resourceType);
    const next = current + amount;
    const db = getDb();

    await db
      .insert(cityResources)
      .values({ resourceType, balance: next })
      .onConflictDoUpdate({
        target: cityResources.resourceType,
        set: { balance: next },
      });

    return next;
  },

  async spend(resourceType: CityResourceTypeValue, amount: number): Promise<boolean> {
    if (amount <= 0) return true;

    const current = await CityResourceRepository.getBalance(resourceType);
    if (current < amount) return false;

    const next = current - amount;
    const db = getDb();

    await db
      .update(cityResources)
      .set({ balance: next })
      .where(eq(cityResources.resourceType, resourceType));

    return true;
  },
};
