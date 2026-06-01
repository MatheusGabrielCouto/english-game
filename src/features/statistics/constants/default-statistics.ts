export const ESTIMATED_STUDY_MINUTES_PER_DAY = 20;

export const STATISTICS_MESSAGES = {
  loading: 'Carregando estatísticas...',
  emptyMilestones: 'Seus marcos aparecerão aqui conforme você avança.',
} as const;

export const LOOT_RARITY_LABELS: Record<string, string> = {
  common: 'Comum',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Lendária',
};

export const LOOT_RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'] as const;
