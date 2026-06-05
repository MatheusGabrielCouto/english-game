export const PET_TRAIT_UI = {
  title: 'Traits',
  empty: 'Sem traits rolados',
  rerollSlot: 'Rerrolar slot',
  rerollAll: 'Rerrolar todos',
  rerollCoins: (cost: number) => `Rerrolar (${cost.toLocaleString('pt-BR')} 🪙)`,
  rerollAllCoins: (cost: number) => `Rerrolar todos (${cost.toLocaleString('pt-BR')} 🪙)`,
  useItem: 'Usar item Trait Reroll',
  globalBonus: 'Traits do companheiro (efeito global)',
  futureTrait: 'Efeito em breve (aventura/fazenda)',
} as const;
