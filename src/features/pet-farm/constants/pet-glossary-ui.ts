import type { PetRarityValue } from '@/types/pet';

export const PET_GLOSSARY_UI = {
  subtitle: 'Dex de espécies — passivos, raridade e tempo de eclosão.',
  searchPlaceholder: 'Buscar por nome ou espécie…',
  searchLabel: 'Buscar',
  filterAll: 'Todas',
  filterHybrids: 'Híbridos',
  sectionHybrids: 'Híbridos exclusivos',
  discovered: 'Na sua coleção',
  notDiscovered: 'Ainda não descoberto',
  hatch: (hours: number) => `Eclosão ~${hours}h`,
  statBias: 'Viés de atributos',
  statRange: (min: number, max: number, cap: number) =>
    `Stats típicos ${min}–${max} (teto ${cap})`,
  emptySearch: 'Nenhuma espécie encontrada.',
  count: (shown: number, total: number) => `${shown} de ${total} espécies`,
  goEncyclopedia: 'Ver enciclopédia de cruzamento',
} as const;

export type PetGlossaryFilter = 'all' | 'hybrid' | PetRarityValue;

export const PET_GLOSSARY_FILTERS: { key: PetGlossaryFilter; label: string }[] = [
  { key: 'all', label: PET_GLOSSARY_UI.filterAll },
  { key: 'hybrid', label: PET_GLOSSARY_UI.filterHybrids },
  { key: 'legendary', label: 'Lendário' },
  { key: 'epic', label: 'Épico' },
  { key: 'rare', label: 'Raro' },
  { key: 'common', label: 'Comum' },
];
