import { and, eq } from 'drizzle-orm';

import { getDb } from '@/storage/database/client';
import { petCosmeticInventory } from '@/storage/database/schema';
import type { PetCosmeticInventoryEntry } from '@/types/pet-cosmetic-inventory';

const mapRow = (row: typeof petCosmeticInventory.$inferSelect): PetCosmeticInventoryEntry => ({
  instanceId: row.instanceId,
  cosmeticKey: row.cosmeticKey,
  acquiredAt: row.acquiredAt,
  source: row.source,
});

export const PetCosmeticInventoryRepository = {
  async listForInstance(instanceId: number): Promise<PetCosmeticInventoryEntry[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(petCosmeticInventory)
      .where(eq(petCosmeticInventory.instanceId, instanceId));
    return rows.map(mapRow);
  },

  async has(instanceId: number, cosmeticKey: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select()
      .from(petCosmeticInventory)
      .where(
        and(
          eq(petCosmeticInventory.instanceId, instanceId),
          eq(petCosmeticInventory.cosmeticKey, cosmeticKey),
        ),
      )
      .limit(1);
    return rows.length > 0;
  },

  async grant(input: {
    instanceId: number;
    cosmeticKey: string;
    source: string;
  }): Promise<boolean> {
    const exists = await PetCosmeticInventoryRepository.has(input.instanceId, input.cosmeticKey);
    if (exists) return false;

    const db = getDb();
    await db.insert(petCosmeticInventory).values({
      instanceId: input.instanceId,
      cosmeticKey: input.cosmeticKey,
      acquiredAt: new Date().toISOString(),
      source: input.source,
    });
    return true;
  },
};
