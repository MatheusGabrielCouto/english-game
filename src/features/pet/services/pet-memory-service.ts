import { usePlayerStore } from '@/features/player/store/player-store';
import { GameEvents, type GameEvent } from '@/services/game-events';
import {
  getPetMemories,
  hasPetMemory,
  unlockPetMemory,
} from '@/storage/repositories/pet-memory-repository';
import { PetStage, type Pet } from '@/types/pet';
import type { PetMemoryRecord } from '@/types/pet-expansion';

import { PET_MEMORY_DEFINITIONS } from '../catalogs/pet-dialogues-catalog';
import { clampAffinity } from '../utils/affinity';
import { PetService } from './pet-service';

let listenersInitialized = false;

export const PetMemoryService = {
  async getMemories(): Promise<PetMemoryRecord[]> {
    return getPetMemories();
  },

  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void PetMemoryService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'PET_STAGE_EVOLVED':
        if (event.stage === PetStage.BABY) {
          await PetMemoryService.tryUnlock('first_evolution');
        }
        if (event.stage === PetStage.LEGENDARY) {
          await PetMemoryService.tryUnlock('legendary_stage');
        }
        break;
      case 'CONTRACT_COMPLETED':
        await PetMemoryService.tryUnlock('first_contract');
        break;
      case 'PLAYER_LEVEL_UP':
        if (event.level >= 50) {
          await PetMemoryService.tryUnlock('level_50');
        }
        break;
      case 'PET_INTERACTION': {
        const pet = PetService.getCachedPet();
        if (!pet) return;
        if (pet.affinity >= 500) await PetMemoryService.tryUnlock('affinity_500');
        if (pet.affinity >= 1000) await PetMemoryService.tryUnlock('affinity_1000');
        break;
      }
      default:
        break;
    }

    const streak = usePlayerStore.getState().currentStreak;
    if (streak >= 7) {
      await PetMemoryService.tryUnlock('first_streak_7');
    }
  },

  async seedInitialMemories(): Promise<void> {
    await PetMemoryService.tryUnlock('first_day');
  },

  async tryUnlock(memoryKey: string): Promise<boolean> {
    const definition = PET_MEMORY_DEFINITIONS.find((item) => item.key === memoryKey);
    if (!definition) return false;

    const exists = await hasPetMemory(memoryKey);
    if (exists) return false;

    const record: PetMemoryRecord = {
      memoryKey: definition.key,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      unlockedAt: new Date().toISOString(),
    };

    const unlocked = await unlockPetMemory(record);
    if (unlocked) {
      GameEvents.emit({ type: 'PET_MEMORY_CREATED', memoryKey, title: record.title });
    }
    return unlocked;
  },

  async syncAffinityMemories(pet: Pet): Promise<void> {
    if (pet.affinity >= 500) await PetMemoryService.tryUnlock('affinity_500');
    if (pet.affinity >= clampAffinity(1000)) await PetMemoryService.tryUnlock('affinity_1000');
  },
};
