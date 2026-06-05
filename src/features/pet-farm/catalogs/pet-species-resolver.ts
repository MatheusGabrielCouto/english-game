import {
    PET_SPECIES_BY_KEY,
    PET_SPECIES_CATALOG,
    type PetSpeciesDefinition,
} from '@/features/game-design/catalogs/pet-species-catalog';

import { PET_HYBRID_BY_KEY, PET_HYBRID_SPECIES } from './pet-hybrid-species';

export const ALL_PET_SPECIES: PetSpeciesDefinition[] = [
  ...PET_SPECIES_CATALOG,
  ...PET_HYBRID_SPECIES,
];

export const getSpeciesDefinition = (speciesKey: string): PetSpeciesDefinition =>
  PET_HYBRID_BY_KEY[speciesKey] ??
  PET_SPECIES_BY_KEY[speciesKey] ??
  PET_SPECIES_CATALOG[0];
