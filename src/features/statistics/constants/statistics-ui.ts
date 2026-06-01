export const STATISTICS_UI = {
  screenTitle: 'Estatísticas',
  screenSubtitle: 'Dashboard da sua jornada',
  heroTitle: 'Painel do jogador',
  sections: {
    consistency: { title: 'Consistência', emoji: '🔥', subtitle: 'Streak, dias e escudos' },
    quests: { title: 'Missões', emoji: '⚔️', subtitle: 'Daily e weekly quests' },
    collection: { title: 'Coleção', emoji: '🎒', subtitle: 'Pet, loot e conquistas' },
    world: { title: 'Mundo', emoji: '🌍', subtitle: 'Contratos e cidade' },
    history: { title: 'Histórico', emoji: '📜', subtitle: 'Marcos da evolução' },
  },
  insightsTitle: 'Destaques',
  milestonesMore: (count: number) => `+${count} marcos anteriores`,
  milestonesPreview: 5,
} as const;
