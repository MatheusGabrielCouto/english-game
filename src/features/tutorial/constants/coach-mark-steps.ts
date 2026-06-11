import type { Href } from 'expo-router'

export type CoachMarkTargetKey = 'home-do-now' | 'home-player-coins' | 'home-pet-card' | 'tab-menu'

export type CoachMarkPlacement = 'top' | 'bottom'

export type CoachMarkStep = {
  id: string
  targetKey: CoachMarkTargetKey
  route?: Href
  emoji: string
  title: string
  body: string
  placement: CoachMarkPlacement
}

export const COACH_MARK_STEPS: CoachMarkStep[] = [
  {
    id: 'home-mission',
    targetKey: 'home-do-now',
    route: '/(tabs)/' as Href,
    emoji: '🎯',
    title: 'Faça agora',
    body: 'Sua missão do dia fica em destaque. Toque em Fazer agora quando estiver pronto.',
    placement: 'bottom',
  },
  {
    id: 'pet-companion',
    targetKey: 'home-pet-card',
    route: '/(tabs)/' as Href,
    emoji: '🐾',
    title: 'Seu companheiro',
    body: 'Seu pet evolui com seus estudos — inclusive enquanto incubando. Toque neste card para ver o laboratório e acompanhar o progresso.',
    placement: 'bottom',
  },
  {
    id: 'home-coins',
    targetKey: 'home-player-coins',
    route: '/(tabs)/' as Href,
    emoji: '🪙',
    title: 'Moedas e recompensas',
    body: 'Missões e streak geram moedas. Use na Loja para escudos, loot e upgrades.',
    placement: 'bottom',
  },
  {
    id: 'tab-menu',
    targetKey: 'tab-menu',
    route: '/(tabs)/' as Href,
    emoji: '📋',
    title: 'Menu completo',
    body: 'Todos os modos do jogo ficam aqui. Fixe favoritos com o marcador nos cards.',
    placement: 'top',
  },
]

export const COACH_MARK_UI = {
  skip: 'Pular tour',
  next: 'Próximo',
  finish: 'Começar a jogar',
  waiting: 'Preparando destaque…',
} as const
