export const STATISTICS_UI = {
  screenTitle: 'Insights',
  screenSubtitle: 'Uma dica por dia — métricas ficam em Detalhes quando quiser',
  heroTitle: 'Seu radar no jogo',
  insightsFeed: {
    eyebrow: 'Dica de hoje',
    hint: 'Um próximo passo sugerido com base no seu jogo agora.',
    footer: 'Amanhã vem outra dica. Números completos ficam em Detalhes abaixo.',
  },
  sections: {
    progress: { title: 'Progresso', emoji: '🔥', subtitle: 'Chama acesa e ritmo de estudo' },
    activity: { title: 'Atividade', emoji: '⚔️', subtitle: 'Missões, contratos e cidade' },
    collection: { title: 'Coleção & histórico', emoji: '🎒', subtitle: 'Pet, loot, conquistas e marcos' },
    details: { title: 'Detalhes', emoji: '📈', subtitle: 'Números completos quando quiser mergulhar' },
  },
  insightsTitle: 'Próximo passo',
  milestonesMore: (count: number) => `+${count} marcos anteriores`,
  milestonesPreview: 5,
} as const;
