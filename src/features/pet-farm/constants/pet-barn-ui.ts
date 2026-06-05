export const PET_BARN_UI = {
  subtitle: 'Todos os seus pets guardados na fazenda.',
  capacity: (n: number, max: number) => `${n}/${max} no celeiro`,
  searchLabel: 'Buscar no celeiro',
  searchPlaceholder: 'Nome ou espécie…',
  assignBanner: (slot: number) => `Escolha um pet para o slot ${slot + 1} do pasto`,
  assignHint: 'Só aparecem pets livres (fora do pasto).',
  empty: 'Nenhum pet encontrado.',
  emptyAssign: 'Nenhum pet livre para este slot.',
  goPasture: 'Voltar ao pasto',
} as const;
