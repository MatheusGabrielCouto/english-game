import { eq } from 'drizzle-orm';

import { getSpeciesDefinition } from '@/features/pet-farm/catalogs/pet-species-resolver';
import { PetFarmBonusCache } from '@/features/pet-farm/services/pet-farm-bonus-cache';
import { PetStatsService } from '@/features/pet-farm/services/pet-stats-service';
import { serializeEquippedCosmetics } from '@/features/pet-farm/utils/pet-equipped-cosmetics';
import { PetService } from '@/features/pet/services/pet-service';
import { GameEvents } from '@/services/game-events';
import { getDb } from '@/storage/database/client';
import { pets } from '@/storage/database/schema';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import { PetStage, type Pet } from '@/types/pet';

let initialized = false;

export const PetRosterService = {
  async ensureInitialized(): Promise<void> {
    if (!initialized) {
      const instances = await PetInstanceRepository.listAll();
      if (instances.length === 0) {
        const legacyPet = await getOrCreatePet();
        const gender = PetStatsService.rollGender(legacyPet.id);
        const stats = PetStatsService.rollInitialStats(legacyPet.speciesKey);

        const instance = await PetInstanceRepository.create({
          speciesKey: legacyPet.speciesKey,
          gender,
          nickname: legacyPet.name,
          stage: legacyPet.stage,
          level: legacyPet.level,
          experience: legacyPet.experience,
          stats,
          isActive: true,
        });

        const db = getDb();
        await db.update(pets).set({ instanceId: instance.id }).where(eq(pets.id, legacyPet.id));
        const { PetInstanceMemoryService } = await import('./pet-instance-memory-service');
        await PetInstanceMemoryService.onInstanceCreated(instance);
      }
      initialized = true;
    }

    const { PetGenerationService } = await import('./pet-generation-service');
    const { PetTraitService } = await import('./pet-trait-service');
    const { PetPersonalityService } = await import('./pet-personality-service');
    const { PetPersonalityCache } = await import('./pet-personality-cache');
    await PetGenerationService.backfillAllInstances();
    await PetTraitService.backfillMissingTraits();
    await PetPersonalityService.backfillMissingPersonalities();
    await PetPersonalityCache.refresh();
    const { PetInstanceMemoryService } = await import('./pet-instance-memory-service');
    PetInstanceMemoryService.initListeners();
    await PetInstanceMemoryService.backfillAllInstances();

    if (__DEV__) {
      const { PetRosterDemoSeed } = await import('./pet-roster-demo-seed');
      await PetRosterDemoSeed.ensureMinimumForTesting(4);
      await PetGenerationService.backfillAllInstances();
    }
  },

  async syncActiveInstanceFromPet(pet: Pet): Promise<void> {
    await PetRosterService.ensureInitialized();
    const active = await PetInstanceRepository.findActive();
    if (!active) return;

    const previousLevel = active.level;
    const previousStage = active.stage;

    active.speciesKey = pet.speciesKey;
    active.nickname = pet.name;
    active.stage = pet.stage;
    active.level = pet.level;
    active.experience = pet.experience;
    await PetInstanceRepository.update(active);

    const { PetInstanceMemoryService } = await import('./pet-instance-memory-service');
    await PetInstanceMemoryService.onActiveInstanceProgress({
      instanceId: active.id,
      previousLevel,
      previousStage,
      nextLevel: pet.level,
      nextStage: pet.stage,
      nickname: active.nickname,
      speciesKey: active.speciesKey,
    });
  },

  async syncPetFromActiveInstance(): Promise<Pet> {
    await PetRosterService.ensureInitialized();
    const pet = await getOrCreatePet();
    const active = await PetInstanceRepository.findActive();
    if (!active) return pet;

    const updated: Pet = {
      ...pet,
      speciesKey: active.speciesKey,
      name: active.nickname,
      stage: active.stage,
      level: active.level,
      experience: active.experience,
      updatedAt: new Date().toISOString(),
    };
    await savePet(updated);

    const db = getDb();
    if (!pet.id) return updated;
    const rows = await db.select().from(pets).where(eq(pets.id, pet.id)).limit(1);
    if (rows[0] && rows[0].instanceId !== active.id) {
      await db.update(pets).set({ instanceId: active.id }).where(eq(pets.id, pet.id));
    }
    return updated;
  },

  async setActiveInstance(instanceId: number): Promise<Pet> {
    const target = await PetInstanceRepository.findById(instanceId);
    if (!target) throw new Error('Instância não encontrada');

    await PetInstanceRepository.setActive(instanceId);
    const pet = await getOrCreatePet();
    const updated: Pet = {
      ...pet,
      speciesKey: target.speciesKey,
      name: target.nickname,
      stage: target.stage,
      level: target.level,
      experience: target.experience,
      equippedCosmeticsJson: serializeEquippedCosmetics(target.equippedCosmetics),
      updatedAt: new Date().toISOString(),
    };
    await savePet(updated);
    const db = getDb();
    await db.update(pets).set({ instanceId: target.id }).where(eq(pets.id, pet.id));

    PetService.setCachedPet(updated);
    await PetFarmBonusCache.refresh();
    const { PetTraitBonusCache } = await import('./pet-trait-bonus-cache');
    const { PetPersonalityCache } = await import('./pet-personality-cache');
    await PetTraitBonusCache.refresh();
    await PetPersonalityCache.refresh();
    GameEvents.emit({ type: 'PET_ACTIVE_CHANGED', instanceId: target.id });

    return updated;
  },

  async createFromHatch(input: {
    speciesKey: string;
    stats: import('@/types/pet-instance').PetInstanceStats;
    gender?: import('@/types/pet-instance').PetGenderValue;
    parentMotherId?: number | null;
    parentFatherId?: number | null;
    setActive?: boolean;
  }) {
    const species = getSpeciesDefinition(input.speciesKey);
    const { PetGenerationService } = await import('./pet-generation-service');
    const { PetTraitRollService } = await import('./pet-trait-roll-service');
    const { PetTraitBonusCache } = await import('./pet-trait-bonus-cache');
    const generation = await PetGenerationService.assignGenerationOnCreate({
      parentMotherId: input.parentMotherId,
      parentFatherId: input.parentFatherId,
    });
    const mother = input.parentMotherId
      ? await PetInstanceRepository.findById(input.parentMotherId)
      : null;
    const father = input.parentFatherId
      ? await PetInstanceRepository.findById(input.parentFatherId)
      : null;
    const traitKeys =
      mother || father
        ? PetTraitRollService.rollBreedingTraits(input.speciesKey, mother, father)
        : PetTraitRollService.rollInitialTraits(input.speciesKey);

    const instance = await PetInstanceRepository.create({
      speciesKey: input.speciesKey,
      gender: input.gender ?? PetStatsService.rollGender(),
      nickname: species.name,
      stage: PetStage.BABY,
      stats: input.stats,
      isActive: input.setActive ?? false,
      parentMotherId: input.parentMotherId ?? null,
      parentFatherId: input.parentFatherId ?? null,
      generation,
      traitKeys,
    });
    await PetGenerationService.syncAchievementsAfterGenerationChange();
    if (instance.isActive) {
      await PetTraitBonusCache.refresh();
      const { PetPersonalityCache } = await import('./pet-personality-cache');
      await PetPersonalityCache.refresh();
    }

    const { PetInstanceMemoryService } = await import('./pet-instance-memory-service');
    await PetInstanceMemoryService.onInstanceCreated(instance);

    return instance;
  },
};
