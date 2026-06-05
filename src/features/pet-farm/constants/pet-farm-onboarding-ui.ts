import type { PetFarmMapBuildingKey } from '../catalogs/pet-farm-map-catalog'

export type PetFarmOnboardingTargetKey = Extract<
  PetFarmMapBuildingKey,
  'incubator' | 'breeding' | 'barn'
>

export type PetFarmOnboardingPlacement = 'top' | 'bottom'

export type PetFarmOnboardingStep = {
  id: string
  targetKey: PetFarmOnboardingTargetKey
  emoji: string
  title: string
  body: string
  placement: PetFarmOnboardingPlacement
}

export const PET_FARM_ONBOARDING_STEPS: PetFarmOnboardingStep[] = [
  {
    id: 'incubator',
    targetKey: 'incubator',
    emoji: '🥚',
    title: 'Comece no Incubador',
    body: 'Ovos chocam aqui. Toque na Incubadora para ver a fila e chocar quando estiver pronto.',
    placement: 'top',
  },
  {
    id: 'breeding',
    targetKey: 'breeding',
    emoji: '💕',
    title: 'Gere ovos no Laboratório',
    body: 'Cruze dois pets adultos para criar ovos. Depois leve-os à Incubadora.',
    placement: 'top',
  },
  {
    id: 'barn',
    targetKey: 'barn',
    emoji: '🏠',
    title: 'Pets no Celeiro',
    body: 'Pets recém-nascidos ficam no Celeiro. De lá você os coloca no pasto ou cruza de novo.',
    placement: 'top',
  },
]

export const PET_FARM_ONBOARDING_UI = {
  welcome: {
    emoji: '🏝️',
    title: 'Bem-vindo à Ilha dos Pets',
    body: 'Crie sua coleção cruzando pets e chocando ovos. O primeiro passo é a Incubadora.',
    startCta: 'Começar tour',
    skipCta: 'Explorar sozinho',
  },
  incubatorHint: 'Comece aqui →',
  skip: 'Pular tour',
  next: 'Próximo',
  finish: 'Explorar ilha',
  waiting: 'Preparando destaque…',
} as const

export const PET_FARM_ONBOARDING_TARGET_KEYS = PET_FARM_ONBOARDING_STEPS.map(
  (step) => step.targetKey,
)
