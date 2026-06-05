export const STATISTICS_UI = {
  screenTitle: 'Estatísticas',
  screenSubtitle: 'Seu próximo passo, em um lugar',
  heroTitle: 'Resumo do jogador',
  sections: {
    progress: { title: 'Progresso', emoji: '🔥', subtitle: 'Streak, dias e visão geral' },
    activity: { title: 'Atividade', emoji: '⚔️', subtitle: 'Missões, contratos e cidade' },
    collection: { title: 'Coleção & histórico', emoji: '🎒', subtitle: 'Pet, loot, conquistas e marcos' },
  },
  insightsTitle: 'Próximo passo',
  milestonesMore: (count: number) => `+${count} marcos anteriores`,
  milestonesPreview: 5,
} as const;
