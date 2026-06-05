import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import type { PetInstance } from '@/types/pet-instance';

import { computeChildGeneration, PET_GENERATION_MAX } from '../utils/pet-generation';

const resolveGenerationMemo = (
  instance: PetInstance,
  byId: Map<number, PetInstance>,
  memo: Map<number, number>,
  visiting: Set<number>,
): number => {
  if (memo.has(instance.id)) return memo.get(instance.id)!;
  if (visiting.has(instance.id)) return instance.generation ?? 1;
  visiting.add(instance.id);

  let generation = 1;
  if (instance.parentMotherId || instance.parentFatherId) {
    const mother = instance.parentMotherId ? byId.get(instance.parentMotherId) : null;
    const father = instance.parentFatherId ? byId.get(instance.parentFatherId) : null;
    const motherGen = mother ? resolveGenerationMemo(mother, byId, memo, visiting) : null;
    const fatherGen = father ? resolveGenerationMemo(father, byId, memo, visiting) : null;
    generation = computeChildGeneration(motherGen, fatherGen);
  }

  visiting.delete(instance.id);
  memo.set(instance.id, generation);
  return generation;
};

export const PetGenerationService = {
  computeForParents(mother: PetInstance | null, father: PetInstance | null): number {
    return computeChildGeneration(mother?.generation ?? null, father?.generation ?? null);
  },

  async getMaxGenerationInCollection(): Promise<number> {
    const all = await PetInstanceRepository.listAll();
    if (all.length === 0) return 0;
    return Math.max(...all.map((i) => i.generation));
  },

  async backfillAllInstances(): Promise<number> {
    const all = await PetInstanceRepository.listAll();
    if (all.length === 0) return 0;

    const byId = new Map(all.map((i) => [i.id, i]));
    const memo = new Map<number, number>();
    let updated = 0;

    for (const instance of all) {
      const next = resolveGenerationMemo(instance, byId, memo, new Set());
      const clamped = Math.min(PET_GENERATION_MAX, Math.max(1, next));
      if (instance.generation !== clamped) {
        instance.generation = clamped;
        await PetInstanceRepository.update(instance);
        updated += 1;
      }
    }

    return updated;
  },

  async assignGenerationOnCreate(input: {
    parentMotherId?: number | null;
    parentFatherId?: number | null;
  }): Promise<number> {
    const mother = input.parentMotherId
      ? await PetInstanceRepository.findById(input.parentMotherId)
      : null;
    const father = input.parentFatherId
      ? await PetInstanceRepository.findById(input.parentFatherId)
      : null;
    return PetGenerationService.computeForParents(mother, father);
  },

  async syncAchievementsAfterGenerationChange(): Promise<void> {
    const { AchievementService } = await import(
      '@/features/achievements/services/achievement-service'
    );
    await AchievementService.refresh();
  },
};
