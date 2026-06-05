import { eq } from 'drizzle-orm';

import { getDb } from '@/storage/database/client';
import { petInstances } from '@/storage/database/schema';
import type { PetInstance, PetInstanceStats, PetFavoriteTagValue } from '@/types/pet-instance';

import { parseStatsJson, serializeStats } from '@/features/pet-farm/catalogs/pet-stat-rules';
import { parseEquippedCosmeticsJson, serializeEquippedCosmetics } from '@/features/pet-farm/utils/pet-equipped-cosmetics';
import { PetStatsService } from '@/features/pet-farm/services/pet-stats-service';
import { DEFAULT_PERSONALITY_KEY } from '@/features/pet-farm/catalogs/pet-personalities-catalog';
import { PetPersonalityService } from '@/features/pet-farm/services/pet-personality-service';
import { PetTraitRollService } from '@/features/pet-farm/services/pet-trait-roll-service';
import { parseTraitKeysJson, serializeTraitKeys } from '@/features/pet-farm/utils/pet-trait-keys';

const mapRow = (row: typeof petInstances.$inferSelect): PetInstance => {
  const stats = parseStatsJson(row.statsJson);
  return {
    id: row.id,
    speciesKey: row.speciesKey,
    gender: row.gender as PetInstance['gender'],
    nickname: row.nickname,
    stage: row.stage as PetInstance['stage'],
    level: row.level,
    experience: row.experience,
    stats,
    effectivePassiveValue: row.effectivePassiveValue,
    isActive: row.isActive,
    passiveFieldSlot: row.passiveFieldSlot ?? null,
    breedingPenSlot: row.breedingPenSlot ?? null,
    parentMotherId: row.parentMotherId ?? null,
    parentFatherId: row.parentFatherId ?? null,
    generation: row.generation ?? 1,
    traitKeys: parseTraitKeysJson(row.traitKeysJson),
    personalityKey: row.personalityKey ?? DEFAULT_PERSONALITY_KEY,
    breedingCooldownUntil: row.breedingCooldownUntil ?? null,
    favoriteTag: (row.favoriteTag ?? 'none') as PetFavoriteTagValue,
    hallOfFameSlot: row.hallOfFameSlot ?? null,
    totalAdventures: row.totalAdventures ?? 0,
    equippedCosmetics: parseEquippedCosmeticsJson(row.equippedCosmeticsJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const PetInstanceRepository = {
  async listAll(): Promise<PetInstance[]> {
    const db = getDb();
    const rows = await db.select().from(petInstances);
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<PetInstance | null> {
    const db = getDb();
    const rows = await db.select().from(petInstances).where(eq(petInstances.id, id)).limit(1);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findActive(): Promise<PetInstance | null> {
    const db = getDb();
    const rows = await db.select().from(petInstances).where(eq(petInstances.isActive, true)).limit(1);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(input: {
    speciesKey: string;
    gender: PetInstance['gender'];
    nickname: string;
    stage: PetInstance['stage'];
    level?: number;
    experience?: number;
    stats?: PetInstanceStats;
    isActive?: boolean;
    parentMotherId?: number | null;
    parentFatherId?: number | null;
    generation?: number;
    traitKeys?: string[];
    personalityKey?: string;
  }): Promise<PetInstance> {
    const db = getDb();
    const now = new Date().toISOString();
    const stats = input.stats ?? PetStatsService.rollInitialStats(input.speciesKey);
    const effectivePassiveValue = PetStatsService.computeEffectivePassive(input.speciesKey, stats);
    const traitKeys =
      input.traitKeys ?? PetTraitRollService.rollInitialTraits(input.speciesKey);

    const rows = await db
      .insert(petInstances)
      .values({
        speciesKey: input.speciesKey,
        gender: input.gender,
        nickname: input.nickname,
        stage: input.stage,
        level: input.level ?? 1,
        experience: input.experience ?? 0,
        statsJson: serializeStats(stats),
        effectivePassiveValue,
        isActive: input.isActive ?? false,
        parentMotherId: input.parentMotherId ?? null,
        parentFatherId: input.parentFatherId ?? null,
        generation: input.generation ?? 1,
        traitKeysJson: serializeTraitKeys(traitKeys),
        personalityKey: input.personalityKey ?? PetPersonalityService.rollPersonality(),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return mapRow(rows[0]);
  },

  async update(instance: PetInstance): Promise<void> {
    const db = getDb();
    const statsJson = serializeStats(instance.stats);
    const effectivePassiveValue = PetStatsService.computeEffectivePassive(
      instance.speciesKey,
      instance.stats,
    );
    await db
      .update(petInstances)
      .set({
        speciesKey: instance.speciesKey,
        gender: instance.gender,
        nickname: instance.nickname,
        stage: instance.stage,
        level: instance.level,
        experience: instance.experience,
        statsJson,
        effectivePassiveValue,
        passiveFieldSlot: instance.passiveFieldSlot,
        breedingPenSlot: instance.breedingPenSlot,
        isActive: instance.isActive,
        parentMotherId: instance.parentMotherId,
        parentFatherId: instance.parentFatherId,
        generation: instance.generation,
        traitKeysJson: serializeTraitKeys(instance.traitKeys),
        personalityKey: instance.personalityKey,
        breedingCooldownUntil: instance.breedingCooldownUntil,
        favoriteTag: instance.favoriteTag,
        hallOfFameSlot: instance.hallOfFameSlot,
        totalAdventures: instance.totalAdventures,
        equippedCosmeticsJson: serializeEquippedCosmetics(instance.equippedCosmetics),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(petInstances.id, instance.id));
    instance.effectivePassiveValue = effectivePassiveValue;
  },

  async setActive(instanceId: number): Promise<void> {
    const db = getDb();
    const all = await db.select().from(petInstances);
    for (const row of all) {
      await db
        .update(petInstances)
        .set({ isActive: row.id === instanceId, updatedAt: new Date().toISOString() })
        .where(eq(petInstances.id, row.id));
    }
  },

  async clearFieldSlots(): Promise<void> {
    const db = getDb();
    const rows = await db.select().from(petInstances);
    for (const row of rows) {
      if (row.passiveFieldSlot === null && row.breedingPenSlot === null) continue;
      await db
        .update(petInstances)
        .set({
          passiveFieldSlot: null,
          breedingPenSlot: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(petInstances.id, row.id));
    }
  },
};
