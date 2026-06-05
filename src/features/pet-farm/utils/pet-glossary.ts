import type { PetSpeciesDefinition } from '@/features/game-design/catalogs/pet-species-catalog';
import { PetRarity, type PetRarityValue } from '@/types/pet';
import { PET_STAT_KEYS, type PetStatKeyValue } from '@/types/pet-instance';

import {
  PET_STAT_LABELS,
  PET_SPECIES_BASE_STATS,
  RARITY_STAT_RANGE,
} from '../catalogs/pet-stat-rules';
import { PET_HYBRID_BY_KEY } from '../catalogs/pet-hybrid-species';
import { PET_GLOSSARY_UI, type PetGlossaryFilter } from '../constants/pet-glossary-ui';

export const isHybridSpecies = (speciesKey: string): boolean =>
  Boolean(PET_HYBRID_BY_KEY[speciesKey]);

export const filterGlossarySpecies = (
  species: PetSpeciesDefinition[],
  query: string,
  filter: PetGlossaryFilter,
): PetSpeciesDefinition[] => {
  const q = query.trim().toLowerCase();

  return species.filter((s) => {
    if (filter === 'hybrid' && !isHybridSpecies(s.key)) return false;
    if (filter !== 'all' && filter !== 'hybrid' && s.rarity !== filter) return false;
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.key.toLowerCase().includes(q);
  });
};

export type GlossarySection = {
  title: string;
  data: PetSpeciesDefinition[];
};

const RARITY_SECTION_ORDER: PetRarityValue[] = [
  PetRarity.LEGENDARY,
  PetRarity.EPIC,
  PetRarity.RARE,
  PetRarity.COMMON,
];

const raritySectionTitle: Record<PetRarityValue, string> = {
  [PetRarity.COMMON]: 'Comuns',
  [PetRarity.RARE]: 'Raros',
  [PetRarity.EPIC]: 'Épicos',
  [PetRarity.LEGENDARY]: 'Lendários',
};

export const groupGlossarySections = (
  species: PetSpeciesDefinition[],
  filter: PetGlossaryFilter,
): GlossarySection[] => {
  const hybrids = species.filter((s) => isHybridSpecies(s.key));
  const base = species.filter((s) => !isHybridSpecies(s.key));

  const sections: GlossarySection[] = [];

  if (filter === 'all' && hybrids.length > 0) {
    sections.push({ title: PET_GLOSSARY_UI.sectionHybrids, data: sortByName(hybrids) });
  }

  if (filter === 'hybrid') {
    if (hybrids.length > 0) {
      sections.push({ title: PET_GLOSSARY_UI.sectionHybrids, data: sortByName(hybrids) });
    }
    return sections;
  }

  const pool = filter === 'all' ? base : species;
  for (const rarity of RARITY_SECTION_ORDER) {
    const items = pool.filter((s) => s.rarity === rarity);
    if (items.length > 0) {
      sections.push({ title: raritySectionTitle[rarity], data: sortByName(items) });
    }
  }

  return sections;
};

const sortByName = (list: PetSpeciesDefinition[]) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

export const formatSpeciesStatLine = (species: PetSpeciesDefinition): string => {
  const bias = PET_SPECIES_BASE_STATS[species.key];
  if (bias) {
    const parts = PET_STAT_KEYS.map((key: PetStatKeyValue) => {
      const value = bias[key];
      if (value == null) return null;
      return `${PET_STAT_LABELS[key]} ${value}`;
    }).filter(Boolean);
    if (parts.length > 0) return parts.join(' · ');
  }

  const range = RARITY_STAT_RANGE[species.rarity];
  return PET_GLOSSARY_UI.statRange(range.min, range.max, range.cap);
};

export const countByRarity = (species: PetSpeciesDefinition[]) => {
  const counts: Record<PetRarityValue, number> = {
    [PetRarity.COMMON]: 0,
    [PetRarity.RARE]: 0,
    [PetRarity.EPIC]: 0,
    [PetRarity.LEGENDARY]: 0,
  };
  let hybrids = 0;
  for (const s of species) {
    if (isHybridSpecies(s.key)) hybrids += 1;
    else counts[s.rarity] += 1;
  }
  return { ...counts, hybrids, total: species.length };
};
