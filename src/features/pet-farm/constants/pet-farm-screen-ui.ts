export const PET_FARM_SCREEN_UI = {
  tapToOpen: 'Toque para ver detalhes',
  tapToAssign: 'Toque no pet para atribuir ao slot',
  capacity: (used: number, max: number) => `${used} / ${max}`,
  stepMother: '1. Mãe',
  stepFather: '2. Pai',
  stepBreed: '3. Cruzar',
  emptyBarn: 'Nenhum pet no celeiro ainda.',
  emptyBarnAssign: 'Todos os pets já estão no pasto ou não há adultos livres.',
  emptyIncubator: 'Sem ovos na fila. Cruze pets no laboratório.',
  emptyMothers: 'Precisa de uma ♀ adulta no celeiro.',
  emptyFathers: 'Precisa de um ♂ adulto no celeiro.',
  selectBoth: 'Escolha mãe e pai para ver as chances.',
} as const;
