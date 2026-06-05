import { eq } from 'drizzle-orm';

import { getDb } from '@/storage/database/client';
import { petAcademySessions } from '@/storage/database/schema';
import type { PetAcademyEntry, PetAcademyTrackKey } from '@/types/pet-academy';

const mapRow = (row: typeof petAcademySessions.$inferSelect): PetAcademyEntry => ({
  id: row.id,
  instanceId: row.instanceId,
  trackKey: row.trackKey as PetAcademyTrackKey,
  startedAt: row.startedAt,
  endsAt: row.endsAt,
  createdAt: row.createdAt,
});

export const PetAcademyRepository = {
  async listActive(): Promise<PetAcademyEntry[]> {
    const db = getDb();
    const rows = await db.select().from(petAcademySessions);
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<PetAcademyEntry | null> {
    const db = getDb();
    const rows = await db.select().from(petAcademySessions).where(eq(petAcademySessions.id, id)).limit(1);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findActiveForInstance(instanceId: number): Promise<PetAcademyEntry | null> {
    const all = await PetAcademyRepository.listActive();
    return all.find((s) => s.instanceId === instanceId) ?? null;
  },

  async insert(input: {
    instanceId: number;
    trackKey: PetAcademyTrackKey;
    startedAt: string;
    endsAt: string;
  }): Promise<number> {
    const db = getDb();
    const now = new Date().toISOString();
    const rows = await db
      .insert(petAcademySessions)
      .values({
        instanceId: input.instanceId,
        trackKey: input.trackKey,
        startedAt: input.startedAt,
        endsAt: input.endsAt,
        createdAt: now,
      })
      .returning();
    return rows[0].id;
  },

  async remove(id: number): Promise<void> {
    const db = getDb();
    await db.delete(petAcademySessions).where(eq(petAcademySessions.id, id));
  },
};
