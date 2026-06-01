import { eq } from 'drizzle-orm';

import type { PetMemoryRecord } from '@/types/pet-expansion';

import { getDb } from '../database/client';
import { petMemories } from '../database/schema';

const mapRow = (row: typeof petMemories.$inferSelect): PetMemoryRecord => ({
  memoryKey: row.memoryKey,
  title: row.title,
  description: row.description,
  icon: row.icon,
  unlockedAt: row.unlockedAt,
});

export const getPetMemories = async (): Promise<PetMemoryRecord[]> => {
  const db = getDb();
  const rows = await db.select().from(petMemories);
  return rows.map(mapRow).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));
};

export const hasPetMemory = async (memoryKey: string): Promise<boolean> => {
  const db = getDb();
  const rows = await db
    .select({ memoryKey: petMemories.memoryKey })
    .from(petMemories)
    .where(eq(petMemories.memoryKey, memoryKey))
    .limit(1);
  return rows.length > 0;
};

export const unlockPetMemory = async (record: PetMemoryRecord): Promise<boolean> => {
  const exists = await hasPetMemory(record.memoryKey);
  if (exists) return false;

  const db = getDb();
  await db.insert(petMemories).values({
    memoryKey: record.memoryKey,
    title: record.title,
    description: record.description,
    icon: record.icon,
    unlockedAt: record.unlockedAt,
  });
  return true;
};
