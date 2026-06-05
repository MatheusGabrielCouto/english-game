/**
 * Copy por feature para error boundaries (P-33).
 * Código puro — sem imports nativos — para testes Node.
 */
export const ERROR_BOUNDARY_UI = {
  appTitle: 'O app encontrou um problema',
  appHint: 'Feche e abra o app. Se continuar, atualize para a versão mais recente.',
  retryLabel: 'Tentar novamente',
  goBackLabel: 'Voltar',
  devDetailPrefix: 'Detalhe técnico:',
} as const

export const ERROR_BOUNDARY_FEATURES = {
  home: {
    emoji: '🎮',
    title: 'Início indisponível',
    hint: 'Suas missões e progresso estão seguros. Tente recarregar esta tela.',
  },
  play: {
    emoji: '🎯',
    title: 'Hub de jogos indisponível',
    hint: 'Outras abas continuam funcionando. Tente de novo ou volte ao menu.',
  },
  quests: {
    emoji: '📜',
    title: 'Missões indisponíveis',
    hint: 'Seu progresso não foi perdido. Tente recarregar.',
  },
  menu: {
    emoji: '🧭',
    title: 'Menu indisponível',
    hint: 'Use as outras abas enquanto isso. Tente novamente em instantes.',
  },
  profile: {
    emoji: '👤',
    title: 'Perfil indisponível',
    hint: 'Seus dados locais estão intactos. Tente recarregar o perfil.',
  },
  knowledge: {
    emoji: '📚',
    title: 'Knowledge indisponível',
    hint: 'Vault e coleções continuam no dispositivo. Tente de novo.',
  },
  'flash-deck': {
    emoji: '🃏',
    title: 'Flash Deck indisponível',
    hint: 'Seus decks estão salvos localmente. Tente recarregar.',
  },
  'english-journal': {
    emoji: '📝',
    title: 'Diário indisponível',
    hint: 'Suas entradas não foram apagadas. Tente novamente.',
  },
  duels: {
    emoji: '⚔️',
    title: 'Duelos indisponíveis',
    hint: 'Seu progresso de combate está seguro. Tente recarregar.',
  },
  'pet-farm': {
    emoji: '🏝️',
    title: 'Fazenda de Pets indisponível',
    hint: 'Seus pets continuam no dispositivo. Tente de novo.',
  },
  city: {
    emoji: '🏙️',
    title: 'Cidade indisponível',
    hint: 'Marcos e progresso urbano estão salvos. Volte e tente outra vez.',
  },
  pet: {
    emoji: '🐾',
    title: 'Companheiro indisponível',
    hint: 'Humor e XP do pet estão intactos. Tente recarregar.',
  },
  inventory: {
    emoji: '🎒',
    title: 'Inventário indisponível',
    hint: 'Itens e escudos continuam na bolsa local. Tente novamente.',
  },
  farm: {
    emoji: '🌾',
    title: 'Farm de Estudo indisponível',
    hint: 'Study Points e registros locais estão seguros. Tente de novo.',
  },
  'focus-mode': {
    emoji: '🎯',
    title: 'Focus Mode indisponível',
    hint: 'Sessões anteriores foram salvas. Tente iniciar de novo.',
  },
} as const

export type ErrorBoundaryFeatureId = keyof typeof ERROR_BOUNDARY_FEATURES

export const getErrorBoundaryFeature = (featureId: ErrorBoundaryFeatureId) =>
  ERROR_BOUNDARY_FEATURES[featureId]
