import { DEFAULT_PERSONALITY_KEY, type PetPersonalityKey } from '../catalogs/pet-personalities-catalog';
import { PetPersonalityService } from './pet-personality-service';

let cachedKey: PetPersonalityKey = DEFAULT_PERSONALITY_KEY;

export const PetPersonalityCache = {
  getSync(): PetPersonalityKey {
    return cachedKey;
  },

  async refresh(): Promise<PetPersonalityKey> {
    cachedKey = await PetPersonalityService.getActivePersonalityKey();
    return cachedKey;
  },

  reset(): void {
    cachedKey = DEFAULT_PERSONALITY_KEY;
  },
};
