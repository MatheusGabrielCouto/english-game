export const MEMORY_WALL_THEME_LABELS: Record<string, string> = {
  education: 'educação',
  reading: 'leitura',
  food: 'comida',
  travel: 'viagem',
  any: 'geral',
  social: 'social',
};

export const memoryWallThemeLabel = (themeTag: string): string =>
  MEMORY_WALL_THEME_LABELS[themeTag] ?? themeTag;
