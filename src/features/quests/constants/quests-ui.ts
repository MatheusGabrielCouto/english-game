export const QUESTS_UI = {
  tabs: {
    today: 'Hoje',
    week: 'Semana',
    epic: 'Épico',
  },
  today: {
    emptyTitle: 'Nenhuma missão hoje',
    emptyDescription: 'As missões diárias serão geradas automaticamente em instantes.',
    dailyTitle: 'Diárias',
    dailySubtitle: (pending: number, completed: number) =>
      pending > 0
        ? `${pending} pendente${pending > 1 ? 's' : ''} · ${completed} concluída${completed !== 1 ? 's' : ''}`
        : 'Todas concluídas por hoje',
    dailyBadge: (pending: number) =>
      pending > 0 ? `${pending} restantes` : '✓ Completo',
    streakHint: 'Complete as missões para mantê-la viva.',
  },
  week: {
    subtitle: 'Progresso automático enquanto você joga',
  },
  epic: {
    subtitle: 'Metas de longo prazo com recompensas maiores',
    emptyTitle: 'Nenhuma missão épica ativa',
    emptyDescription: 'Continue evoluindo para desbloquear metas de longo prazo.',
  },
} as const

export type QuestsTab = 'today' | 'week' | 'epic'
