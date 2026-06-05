export const PET_INCUBATOR_UI = {
  subtitle: 'Ovos em desenvolvimento até a eclosão.',
  capacity: (n: number, max: number) => `${n}/${max} na fila`,
  empty: 'Nenhum ovo incubando. Cruze pets no laboratório.',
  eggReady: 'Pronto para eclosão!',
  incubating: 'Incubando…',
  hatchAt: (date: string) => `Eclosão ${date}`,
  hatchAll: 'Eclodir ovos prontos',
  goLab: 'Ir ao laboratório',
  goIncubator: 'Ver incubadora',
  hatchDone: 'Eclosão concluída!',
} as const;
