import { and, eq } from 'drizzle-orm';

import type { PetInstanceMemoryRecord } from '@/types/pet-instance-memory';

import { getDb } from '../database/client';
import { petInstanceMemories } from '../database/schema';

const mapRow = (row: typeof petInstanceMemories.$inferSelect): PetInstanceMemoryRecord => ({
  instanceId: row.instanceId,
  memoryKey: row.memoryKey as PetInstanceMemoryRecord['memoryKey'],
  title: row.title,
  description: row.description,
  icon: row.icon,
  unlockedAt: row.unlockedAt,
});

export const listPetInstanceMemories = async (
  instanceId: number,
): Promise<PetInstanceMemoryRecord[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(petInstanceMemories)
    .where(eq(petInstanceMemories.instanceId, instanceId));
  return rows.map(mapRow).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));
};

export const hasPetInstanceMemory = async (
  instanceId: number,
  memoryKey: string,
): Promise<boolean> => {
  const db = getDb();
  const rows = await db
    .select({ memoryKey: petInstanceMemories.memoryKey })
    .from(petInstanceMemories)
    .where(
      and(
        eq(petInstanceMemories.instanceId, instanceId),
        eq(petInstanceMemories.memoryKey, memoryKey),
      ),
    )
    .limit(1);
  return rows.length > 0;
};

export const unlockPetInstanceMemory = async (
  record: PetInstanceMemoryRecord,
): Promise<boolean> => {
  const exists = await hasPetInstanceMemory(record.instanceId, record.memoryKey);
  if (exists) return false;

  const db = getDb();
  await db.insert(petInstanceMemories).values({
    instanceId: record.instanceId,
    memoryKey: record.memoryKey,
    title: record.title,
    description: record.description,
    icon: record.icon,
    unlockedAt: record.unlockedAt,
  });
  return true;
};
