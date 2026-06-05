import {
  getBreedingOutcomes,
  getHybridForPair,
  PET_BREEDING_OUTCOMES,
  type BreedingPairKey,
} from '../catalogs/pet-breeding-outcomes';
import { PET_HYBRID_BY_KEY } from '../catalogs/pet-hybrid-species';

export const hasExplicitBreedingRecipe = (motherKey: string, fatherKey: string): boolean => {
  const key = `${motherKey}__${fatherKey}` as BreedingPairKey;
  return Boolean(PET_BREEDING_OUTCOMES[key]?.length);
};

export const getBreedingPairMeta = (motherKey: string, fatherKey: string) => {
  const hybridKey = getHybridForPair(motherKey, fatherKey);
  const hybridName = hybridKey && PET_HYBRID_BY_KEY[hybridKey] ? PET_HYBRID_BY_KEY[hybridKey].name : null;

  return {
    isSameSpecies: motherKey === fatherKey,
    hasExplicitRecipe: hasExplicitBreedingRecipe(motherKey, fatherKey),
    hybridKey,
    hybridName,
    outcomes: getBreedingOutcomes(motherKey, fatherKey),
  };
};
