import {
  getAnimationsForMood,
  PET_ANIMATIONS_CATALOG,
} from '@/features/pet/catalogs/pet-animations-catalog';
import type { PetAnimationCategoryValue, PetAnimationDefinition } from '@/types/pet-expansion';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';

import {
  DEFAULT_PERSONALITY_KEY,
  getPersonalityDefinition,
  PET_PERSONALITY_KEYS,
  type PetPersonalityKey,
} from '../catalogs/pet-personalities-catalog';

export const PetPersonalityService = {
  rollPersonality(): PetPersonalityKey {
    const index = Math.floor(Math.random() * PET_PERSONALITY_KEYS.length);
    return PET_PERSONALITY_KEYS[index] ?? DEFAULT_PERSONALITY_KEY;
  },

  pickAnimation(
    fallbackCategory: PetAnimationCategoryValue,
    affinity: number,
    personalityKey: string | null | undefined,
  ): PetAnimationDefinition {
    const personality = getPersonalityDefinition(personalityKey);
    let pool = getAnimationsForMood(personality.preferredCategory, affinity);

    if (personality.animationHints.length > 0) {
      const hinted = pool.filter((anim) =>
        personality.animationHints.some((hint) => anim.key.includes(hint)),
      );
      if (hinted.length > 0) pool = hinted;
    }

    if (pool.length === 0) {
      pool = getAnimationsForMood(fallbackCategory, affinity);
    }
    if (pool.length === 0) return PET_ANIMATIONS_CATALOG[0];
    return pool[Math.floor(Math.random() * pool.length)] ?? PET_ANIMATIONS_CATALOG[0];
  },

  async getActivePersonalityKey(): Promise<PetPersonalityKey> {
    const active = await PetInstanceRepository.findActive();
    return (active?.personalityKey as PetPersonalityKey) ?? DEFAULT_PERSONALITY_KEY;
  },

  async backfillMissingPersonalities(): Promise<number> {
    const all = await PetInstanceRepository.listAll();
    let updated = 0;
    for (const instance of all) {
      if (instance.personalityKey && instance.personalityKey.length > 0) continue;
      instance.personalityKey = PetPersonalityService.rollPersonality();
      await PetInstanceRepository.update(instance);
      updated += 1;
    }
    return updated;
  },
};
