import { getTraitDefinition } from '@/features/pet-farm/catalogs/pet-traits-catalog';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { getDb } from '@/storage/database/client';
import { petBreedingLog } from '@/storage/database/schema';
import {
    hasPetInstanceMemory,
    listPetInstanceMemories,
    unlockPetInstanceMemory,
} from '@/storage/repositories/pet-instance-memory-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetStage, type PetStageValue } from '@/types/pet';
import type { PetInstance } from '@/types/pet-instance';
import type { PetInstanceMemoryKey, PetInstanceMemoryRecord } from '@/types/pet-instance-memory';

import { getInstanceMemoryDefinition } from '../catalogs/pet-instance-memories-catalog';

let listenersInitialized = false;

const STAGE_RANK: Record<PetStageValue, number> = {
  [PetStage.EGG]: 0,
  [PetStage.BABY]: 1,
  [PetStage.TEEN]: 2,
  [PetStage.ADULT]: 3,
  [PetStage.LEGENDARY]: 4,
};

const hasEpicTrait = (traitKeys: string[]): boolean =>
  traitKeys.some((key) => getTraitDefinition(key)?.poolRarity === 'epic');

export const PetInstanceMemoryService = {
  async getMemories(instanceId: number): Promise<PetInstanceMemoryRecord[]> {
    return listPetInstanceMemories(instanceId);
  },

  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void PetInstanceMemoryService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'PET_BRED':
        await PetInstanceMemoryService.tryUnlock(event.motherInstanceId, 'first_breed');
        await PetInstanceMemoryService.tryUnlock(event.fatherInstanceId, 'first_breed');
        break;
      case 'PET_STAGE_EVOLVED': {
        const active = await PetInstanceRepository.findActive();
        if (!active) return;
        await PetInstanceMemoryService.tryUnlock(active.id, 'first_evolution');
        break;
      }
      default:
        break;
    }
  },

  async tryUnlock(
    instanceId: number,
    memoryKey: PetInstanceMemoryKey,
    unlockedAt?: string,
  ): Promise<boolean> {
    const definition = getInstanceMemoryDefinition(memoryKey);
    if (!definition) return false;

    const exists = await hasPetInstanceMemory(instanceId, memoryKey);
    if (exists) return false;

    const record: PetInstanceMemoryRecord = {
      instanceId,
      memoryKey: definition.key,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      unlockedAt: unlockedAt ?? new Date().toISOString(),
    };

    const unlocked = await unlockPetInstanceMemory(record);
    if (unlocked) {
      GameEvents.emit({
        type: 'PET_MEMORY_CREATED',
        memoryKey: `${instanceId}:${memoryKey}`,
        title: record.title,
      });
    }
    return unlocked;
  },

  async onInstanceCreated(instance: PetInstance): Promise<void> {
    await PetInstanceMemoryService.tryUnlock(instance.id, 'born', instance.createdAt);
    if (instance.generation >= 5) {
      await PetInstanceMemoryService.tryUnlock(instance.id, 'gen_milestone_5', instance.createdAt);
    }
    if (hasEpicTrait(instance.traitKeys)) {
      await PetInstanceMemoryService.tryUnlock(instance.id, 'trait_legendary', instance.createdAt);
    }
    const { PetCosmeticService } = await import('./pet-cosmetic-service');
    await PetCosmeticService.grantRandom(instance.id, 'welcome');
  },

  async onActiveInstanceProgress(input: {
    instanceId: number;
    previousLevel: number;
    previousStage: PetStageValue;
    nextLevel: number;
    nextStage: PetStageValue;
    nickname?: string;
    speciesKey?: string;
  }): Promise<void> {
    if (input.previousLevel < 2 && input.nextLevel >= 2) {
      await PetInstanceMemoryService.tryUnlock(input.instanceId, 'first_level_up');
    }

    const prevRank = STAGE_RANK[input.previousStage] ?? 0;
    const nextRank = STAGE_RANK[input.nextStage] ?? 0;
    if (nextRank > prevRank && input.nextStage !== PetStage.EGG) {
      await PetInstanceMemoryService.tryUnlock(input.instanceId, 'first_evolution');
      const { PetEvolutionService } = await import('./pet-evolution-service');
      await PetEvolutionService.processEvolution({
        previousStage: input.previousStage,
        nextStage: input.nextStage,
        level: input.nextLevel,
        instanceId: input.instanceId,
        nickname: input.nickname,
        speciesKey: input.speciesKey,
      });
    }
  },

  async syncStaticMilestones(instance: PetInstance): Promise<void> {
    if (instance.generation >= 5) {
      await PetInstanceMemoryService.tryUnlock(instance.id, 'gen_milestone_5', instance.createdAt);
    }
    if (hasEpicTrait(instance.traitKeys)) {
      await PetInstanceMemoryService.tryUnlock(instance.id, 'trait_legendary', instance.createdAt);
    }
    if (instance.level >= 2) {
      await PetInstanceMemoryService.tryUnlock(instance.id, 'first_level_up', instance.updatedAt);
    }
    const stageRank = STAGE_RANK[instance.stage] ?? 0;
    if (stageRank > STAGE_RANK[PetStage.EGG]) {
      await PetInstanceMemoryService.tryUnlock(instance.id, 'first_evolution', instance.updatedAt);
    }
  },

  async backfillAllInstances(): Promise<number> {
    const all = await PetInstanceRepository.listAll();
    let added = 0;

    for (const instance of all) {
      const before = await listPetInstanceMemories(instance.id);
      const beforeCount = before.length;

      if (!(await hasPetInstanceMemory(instance.id, 'born'))) {
        await PetInstanceMemoryService.tryUnlock(instance.id, 'born', instance.createdAt);
      }
      await PetInstanceMemoryService.syncStaticMilestones(instance);

      const after = await listPetInstanceMemories(instance.id);
      if (after.length > beforeCount) added += after.length - beforeCount;
    }

    const db = getDb();
    const breedRows = await db.select().from(petBreedingLog);
    for (const row of breedRows) {
      const at = row.rolledAt;
      if (await PetInstanceMemoryService.tryUnlock(row.motherInstanceId, 'first_breed', at)) {
        added += 1;
      }
      if (await PetInstanceMemoryService.tryUnlock(row.fatherInstanceId, 'first_breed', at)) {
        added += 1;
      }
    }

    return added;
  },
};
