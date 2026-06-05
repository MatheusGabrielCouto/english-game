import type { PetRarityValue } from '@/types/pet';

export const PET_ENCYCLOPEDIA_UI = {
  subtitle: 'Simule pares de espécies e veja as chances de filhote.',
  searchLabel: 'Filtrar espécies',
  searchPlaceholder: 'Buscar espécie…',
  pairTitle: 'Par selecionado',
  mother: 'Mãe ♀',
  father: 'Pai ♂',
  swapParents: 'Trocar mãe e pai',
  swapShort: 'Trocar',
  carouselHint: 'Deslize o carrossel para escolher a espécie',
  emptySearch: 'Nenhuma espécie encontrada.',
  pairLabel: (mother: string, father: string) => `${mother} ♀  ×  ${father} ♂`,
  outcomes: 'Filhos possíveis',
  recipeKnown: 'Receita catalogada',
  recipeFallback: 'Chances padrão (sem receita exclusiva)',
  hybridHint: (name: string) => `Este par pode gerar o híbrido ${name}.`,
  sameSpecies: 'Mesma espécie — sempre gera uma cópia.',
  noOutcomes: 'Nenhum resultado para este par.',
  goBreeding: 'Ir ao laboratório',
  hatchHours: (h: number) => `~${h}h para eclosão`,
} as const;

export const PET_RARITY_CHIP_STYLES: Record<
  PetRarityValue,
  { border: string; text: string; bar: string }
> = {
  common: {
    border: 'border-2 border-stone-400/70',
    text: 'text-stone-200',
    bar: 'bg-stone-400',
  },
  rare: {
    border: 'border-2 border-sky-400/80',
    text: 'text-sky-200',
    bar: 'bg-sky-400',
  },
  epic: {
    border: 'border-2 border-violet-400/80',
    text: 'text-violet-200',
    bar: 'bg-violet-400',
  },
  legendary: {
    border: 'border-2 border-amber-300/85',
    text: 'text-amber-100',
    bar: 'bg-amber-400',
  },
};

export const PET_RARITY_LABELS: Record<PetRarityValue, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};
