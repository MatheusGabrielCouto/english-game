import type { TitleDefinition, TitleProgress } from '@/types/title';
import { TITLE_DEFINITIONS } from '../constants/default-titles';

export const resolveTitleForLevel = (level: number): TitleDefinition => {
  let current = TITLE_DEFINITIONS[0];

  for (const title of TITLE_DEFINITIONS) {
    if (level >= title.requiredLevel) {
      current = title;
    }
  }

  return current;
};

export const getNextTitle = (level: number): TitleDefinition | null => {
  return TITLE_DEFINITIONS.find((title) => title.requiredLevel > level) ?? null;
};

export const getEligibleTitles = (level: number): TitleDefinition[] =>
  TITLE_DEFINITIONS.filter((title) => level >= title.requiredLevel);

export const buildTitleProgress = (level: number): TitleProgress => {
  const currentTitle = resolveTitleForLevel(level);
  const nextTitle = getNextTitle(level);
  const levelsUntilNext = nextTitle ? nextTitle.requiredLevel - level : null;

  const progressLabel = nextTitle
    ? `Próximo: ${nextTitle.name} · Nível ${nextTitle.requiredLevel}`
    : 'Você alcançou o título máximo da jornada.';

  return {
    currentLevel: level,
    currentTitle,
    nextTitle,
    levelsUntilNext,
    progressLabel,
  };
};

export const sortTitlesByLevel = (titles: TitleDefinition[]): TitleDefinition[] =>
  [...titles].sort((left, right) => left.requiredLevel - right.requiredLevel);
