import { PET_SPECIES_BY_KEY } from '@/features/game-design/catalogs/pet-species-catalog';
import type { Pet } from '@/types/pet';
import { PetStage } from '@/types/pet';

import { MOOD_CONFIG, STAGE_CONFIG } from '../constants';

export type PetDisplayInfo = {
  name: string;
  speciesName: string;
  speciesEmoji: string;
  stageLabel: string;
  stageEmoji: string;
  /** Emoji da espécie — sempre a criatura (ex.: 🦉), nunca o ovo. */
  displayEmoji: string;
  level: number;
  moodLabel: string;
  moodEmoji: string;
  affinity: number;
};

export type PetDexEntryDisplay = {
  emoji: string;
  name: string;
  subtitle: string;
  /** True when species is registered in the dex (hatched at least once). */
  speciesDiscovered: boolean;
  isActive: boolean;
  isIncubating: boolean;
};

export const isPetIncubating = (pet: Pet): boolean => {
  if (pet.hatchAt && pet.isIncubating && new Date(pet.hatchAt).getTime() > Date.now()) {
    return true;
  }
  return pet.stage === PetStage.EGG || pet.isIncubating;
};

export const getPetDisplayInfo = (pet: Pet): PetDisplayInfo => {
  const species = PET_SPECIES_BY_KEY[pet.speciesKey] ?? PET_SPECIES_BY_KEY.codeowl;
  const stageConfig = STAGE_CONFIG[pet.stage];
  const moodConfig = MOOD_CONFIG[pet.mood];

  return {
    name: pet.name,
    speciesName: species.name,
    speciesEmoji: species.emoji,
    stageLabel: stageConfig.label,
    stageEmoji: stageConfig.emoji,
    displayEmoji: species.emoji,
    level: pet.level,
    moodLabel: moodConfig.label,
    moodEmoji: moodConfig.emoji,
    affinity: pet.affinity,
  };
};

/** Petédex — espécie sempre com emoji da criatura; estágio vai no subtítulo. */
export const getPetDexEntryDisplay = (
  speciesKey: string,
  currentPet: Pet | null,
  speciesDiscoveredInDb: boolean,
): PetDexEntryDisplay => {
  const species = PET_SPECIES_BY_KEY[speciesKey] ?? PET_SPECIES_BY_KEY.codeowl;
  const isActive = currentPet?.speciesKey === speciesKey;

  if (isActive && currentPet) {
    const display = getPetDisplayInfo(currentPet);
    const incubating = isPetIncubating(currentPet);
    let subtitle = `${display.stageLabel} · seu pet`;

    if (incubating && currentPet.hatchAt) {
      const msLeft = new Date(currentPet.hatchAt).getTime() - Date.now();
      if (msLeft > 0) {
        const hoursLeft = Math.ceil(msLeft / (60 * 60 * 1000));
        subtitle =
          hoursLeft < 24
            ? `Ovo · choca em ~${hoursLeft}h`
            : `Ovo · choca em ~${Math.ceil(hoursLeft / 24)} dia(s)`;
      } else {
        subtitle = 'Ovo · eclosão em breve';
      }
    }

    return {
      emoji: species.emoji,
      name: species.name,
      subtitle,
      speciesDiscovered: speciesDiscoveredInDb && !incubating,
      isActive: true,
      isIncubating: incubating,
    };
  }

  if (speciesDiscoveredInDb) {
    return {
      emoji: species.emoji,
      name: species.name,
      subtitle: species.passive.label,
      speciesDiscovered: true,
      isActive: false,
      isIncubating: false,
    };
  }

  return {
    emoji: '❓',
    name: '???',
    subtitle: 'Não descoberto',
    speciesDiscovered: false,
    isActive: false,
    isIncubating: false,
  };
};
