export const PET_PICKER_UI = {
  emptyTitle: 'Nenhum pet disponível',
  count: (n: number) => `${n} disponíve${n === 1 ? 'l' : 'is'}`,
  levelGen: (level: number, gen: number) => `Nível ${level} · GEN ${gen}`,
  activeBadge: 'Companheiro',
  selected: 'Selecionado',
} as const;
