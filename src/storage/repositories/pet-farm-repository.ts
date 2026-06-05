import { desc, eq, or } from 'drizzle-orm';

import { getDb } from '@/storage/database/client';
import { petBreedingLog, petFarmFields, petIncubators } from '@/storage/database/schema';
import type { PetFarmFieldKey, PetIncubatorEntry } from '@/types/pet-instance';

import { serializeStats } from '@/features/pet-farm/catalogs/pet-stat-rules';
import type { PetInstanceStats } from '@/types/pet-instance';

export const PetFarmRepository = {
  async getFieldLevels(): Promise<Record<PetFarmFieldKey, number>> {
    const db = getDb();
    const rows = await db.select().from(petFarmFields);
    const map = {
      passive_pasture: 1,
      breeding_pen: 1,
      incubator_room: 2,
      barn_storage: 12,
    } as Record<PetFarmFieldKey, number>;
    for (const row of rows) {
      map[row.fieldKey as PetFarmFieldKey] = row.level;
    }
    return map;
  },

  async upgradeField(fieldKey: PetFarmFieldKey, nextLevel: number): Promise<void> {
    const db = getDb();
    await db
      .insert(petFarmFields)
      .values({ fieldKey, level: nextLevel })
      .onConflictDoUpdate({
        target: petFarmFields.fieldKey,
        set: { level: nextLevel },
      });
  },

  async listIncubators(): Promise<PetIncubatorEntry[]> {
    const db = getDb();
    const rows = await db.select().from(petIncubators);
    return rows.map((row) => ({
      id: row.id,
      speciesKey: row.speciesKey,
      source: row.source as PetIncubatorEntry['source'],
      hatchAt: row.hatchAt,
      parentMotherId: row.parentMotherId ?? null,
      parentFatherId: row.parentFatherId ?? null,
      predictedStatsJson: row.predictedStatsJson ?? null,
      createdAt: row.createdAt,
    }));
  },

  async addIncubator(input: {
    speciesKey: string;
    source: PetIncubatorEntry['source'];
    hatchAt: string;
    parentMotherId?: number | null;
    parentFatherId?: number | null;
    predictedStats?: PetInstanceStats;
  }): Promise<number> {
    const db = getDb();
    const rows = await db
      .insert(petIncubators)
      .values({
        speciesKey: input.speciesKey,
        source: input.source,
        hatchAt: input.hatchAt,
        parentMotherId: input.parentMotherId ?? null,
        parentFatherId: input.parentFatherId ?? null,
        predictedStatsJson: input.predictedStats ? serializeStats(input.predictedStats) : null,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return rows[0].id;
  },

  async removeIncubator(id: number): Promise<void> {
    const db = getDb();
    await db.delete(petIncubators).where(eq(petIncubators.id, id));
  },

  async listBreedingHistoryForInstance(
    instanceId: number,
    limit = 20,
  ): Promise<
    {
      id: number;
      motherInstanceId: number;
      fatherInstanceId: number;
      outcomeSpeciesKey: string;
      rolledAt: string;
      role: 'mother' | 'father';
    }[]
  > {
    const db = getDb();
    const rows = await db
      .select()
      .from(petBreedingLog)
      .where(
        or(
          eq(petBreedingLog.motherInstanceId, instanceId),
          eq(petBreedingLog.fatherInstanceId, instanceId),
        ),
      )
      .orderBy(desc(petBreedingLog.rolledAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      motherInstanceId: row.motherInstanceId,
      fatherInstanceId: row.fatherInstanceId,
      outcomeSpeciesKey: row.outcomeSpeciesKey,
      rolledAt: row.rolledAt,
      role: row.motherInstanceId === instanceId ? 'mother' : 'father',
    }));
  },

  async logBreeding(input: {
    motherInstanceId: number;
    fatherInstanceId: number;
    outcomeSpeciesKey: string;
    rolledStats: PetInstanceStats;
    parentStatsSnapshot: { mother: PetInstanceStats; father: PetInstanceStats };
    outcomeWeightsSnapshot: unknown;
  }): Promise<void> {
    const db = getDb();
    await db.insert(petBreedingLog).values({
      motherInstanceId: input.motherInstanceId,
      fatherInstanceId: input.fatherInstanceId,
      outcomeSpeciesKey: input.outcomeSpeciesKey,
      rolledStatsJson: serializeStats(input.rolledStats),
      parentStatsSnapshotJson: JSON.stringify(input.parentStatsSnapshot),
      outcomeWeightsSnapshotJson: JSON.stringify(input.outcomeWeightsSnapshot),
      rolledAt: new Date().toISOString(),
    });
  },
};
