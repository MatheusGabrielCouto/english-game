import { PetService } from '@/features/pet/services/pet-service';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import { PetMood } from '@/types/pet';
import { GameEvents } from '@/services/game-events';

import { clampAffinity } from '@/features/pet/utils/affinity';

let initialized = false;

export const FocusPetReactionService = {
  initListeners(): void {
    if (initialized) return;
    initialized = true;

    GameEvents.subscribe((event) => {
      if (event.type === 'FOCUS_SESSION_COMPLETED') {
        void FocusPetReactionService.handleSessionCompleted(event.rewards.focusRatio, event.rewards.petAffinityGain);
      }
      if (event.type === 'FOCUS_DISTRACTION_RECORDED') {
        void FocusPetReactionService.handleDistraction();
      }
    });
  },

  async handleSessionCompleted(focusRatio: number, affinityGain: number): Promise<void> {
    const mood =
      focusRatio >= 0.75 ? PetMood.VERY_HAPPY : focusRatio >= 0.5 ? PetMood.HAPPY : PetMood.NORMAL;

    const pet = PetService.getCachedPet() ?? (await getOrCreatePet());
    const updated = {
      ...pet,
      mood,
      affinity: clampAffinity(pet.affinity + affinityGain),
    };

    await savePet(updated);
    PetService.setCachedPet(updated);
    await PetService.triggerExcitedAnimation();
  },

  async handleDistraction(): Promise<void> {
    const pet = PetService.getCachedPet() ?? (await getOrCreatePet());
    if (pet.mood === PetMood.VERY_SAD) return;

    const mood = pet.mood === PetMood.HAPPY || pet.mood === PetMood.VERY_HAPPY ? PetMood.NORMAL : PetMood.SAD;
    const latest = PetService.getCachedPet() ?? pet;
    const updated = { ...latest, mood };
    await savePet(updated);
    PetService.setCachedPet(updated);
  },
};
