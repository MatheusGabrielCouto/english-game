import { eq, gte } from 'drizzle-orm';

import { getDb } from '@/storage/database/client';
import { petAdventure24hLog, petAdventures } from '@/storage/database/schema';
import type {
    PetAdventureBiomeKey,
    PetAdventureDurationKey,
    PetAdventureEntry,
} from '@/types/pet-adventure';

const mapRow = (row: typeof petAdventures.$inferSelect): PetAdventureEntry => ({
  id: row.id,
  instanceId: row.instanceId,
  biomeKey: row.biomeKey as PetAdventureBiomeKey,
  durationKey: row.durationKey as PetAdventureDurationKey,
  startedAt: row.startedAt,
  endsAt: row.endsAt,
  createdAt: row.createdAt,
});

export const PetAdventureRepository = {
  async listActive(): Promise<PetAdventureEntry[]> {
    const db = getDb();
    const rows = await db.select().from(petAdventures);
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<PetAdventureEntry | null> {
    const db = getDb();
    const rows = await db.select().from(petAdventures).where(eq(petAdventures.id, id)).limit(1);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findActiveForInstance(instanceId: number): Promise<PetAdventureEntry | null> {
    const all = await PetAdventureRepository.listActive();
    return all.find((a) => a.instanceId === instanceId) ?? null;
  },

  async count24hClaimedSince(sinceIso: string): Promise<number> {
    const db = getDb();
    const rows = await db
      .select()
      .from(petAdventure24hLog)
      .where(gte(petAdventure24hLog.claimedAt, sinceIso));
    return rows.length;
  },

  async log24hClaim(claimedAt: string): Promise<void> {
    const db = getDb();
    await db.insert(petAdventure24hLog).values({ claimedAt });
  },

  async insert(input: {
    instanceId: number;
    biomeKey: PetAdventureBiomeKey;
    durationKey: PetAdventureDurationKey;
    startedAt: string;
    endsAt: string;
  }): Promise<number> {
    const db = getDb();
    const now = new Date().toISOString();
    const rows = await db
      .insert(petAdventures)
      .values({
        instanceId: input.instanceId,
        biomeKey: input.biomeKey,
        durationKey: input.durationKey,
        startedAt: input.startedAt,
        endsAt: input.endsAt,
        createdAt: now,
      })
      .returning();
    return rows[0].id;
  },

  async remove(id: number): Promise<void> {
    const db = getDb();
    await db.delete(petAdventures).where(eq(petAdventures.id, id));
  },
};
