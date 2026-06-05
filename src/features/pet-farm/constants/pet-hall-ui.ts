export const PET_HALL_UI = {
  subtitle: 'Seis pedestais de honra — exiba seus campeões da fazenda.',
  autoFillCta: 'Preencher pedestais automaticamente',
  clearSlot: 'Remover',
  induct: 'Induzir ao Hall',
  emptyPedestal: 'Pedestal vazio',
  suggested: (name: string) => `Sugerido: ${name}`,
  metricGen: (gen: number) => `GEN ${gen}`,
  metricLevel: (level: number) => `Nv. ${level}`,
  metricStats: (sum: number) => `${sum} stats`,
  metricAge: 'Desde',
  metricAdventures: (n: number) => `${n} expedições`,
  metricLeagueWins: (n: number) => `${n} vitórias`,
  filledCount: (n: number, max: number) => `${n}/${max} pedestais`,
  autoFillDone: (n: number) => `${n} pets induzidos ao Hall!`,
  removed: 'Pet removido do pedestal.',
  inducted: (name: string) => `${name} entrou no Hall da Fama!`,
} as const;

export const PET_FAVORITE_UI = {
  title: 'Marca especial',
  hint: '⭐ favorito · ❤️ companheiro · 👑 campeão',
  star: 'Favorito',
  heart: 'Companheiro',
  crown: 'Campeão',
  cleared: 'Marca removida.',
} as const;

export const PET_COSMETIC_UI = {
  title: 'Cosméticos',
  hint: 'Só visual — zero bônus de stats.',
  empty: 'Nenhum cosmético ainda.',
  emptyHint: 'Ganhe em aventuras, liga e eventos.',
  equipped: 'Equipado',
  equip: 'Equipar',
  unequip: 'Remover',
  slotLabel: (label: string) => `Slot: ${label}`,
  granted: (name: string) => `${name} desbloqueado!`,
} as const;

export const PET_BARN_FILTER_UI = {
  all: 'Todos',
  favorites: '⭐ Favoritos',
  hearts: '❤️ Companheiros',
  crowns: '👑 Campeões',
  highGen: 'GEN 5+',
  breedReady: 'Prontos breed',
  onAdventure: 'Em aventura',
} as const;
