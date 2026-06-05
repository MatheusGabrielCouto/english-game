import { PetInteractionType, PetRoutinePhase, type PetInteractionTypeValue } from '@/types/pet-expansion'
import type { Pet } from '@/types/pet'

import { PET_INTERACTION_BY_TYPE } from '../constants/pet-interaction-catalog'
import { PET_VITAL_THRESHOLDS } from '../constants/vitals'
import { PetVitalsService } from '../services/pet-vitals-service'
import { isPetIncubating } from './display'

export type PetRecommendedAction = {
  type: PetInteractionTypeValue
  label: string
  emoji: string
  reason: string
}

const toRecommendation = (
  type: PetInteractionTypeValue,
  reason: string,
): PetRecommendedAction => {
  const meta = PET_INTERACTION_BY_TYPE[type]

  return {
    type,
    label: meta.label,
    emoji: meta.emoji,
    reason,
  }
}

const canDo = (pet: Pet, type: PetInteractionTypeValue) => PetVitalsService.canInteract(pet, type)

export const getPetRecommendedAction = (pet: Pet | null | undefined): PetRecommendedAction | null => {
  if (!pet || isPetIncubating(pet)) {
    return null
  }

  if (pet.routinePhase === PetRoutinePhase.SLEEPING) {
    if (canDo(pet, PetInteractionType.TALK)) {
      return toRecommendation(PetInteractionType.TALK, 'Está dormindo — converse baixo')
    }

    return null
  }

  if (
    pet.hunger <= PET_VITAL_THRESHOLDS.LOW_WARNING &&
    canDo(pet, PetInteractionType.FEED)
  ) {
    return toRecommendation(
      PetInteractionType.FEED,
      pet.hunger <= PET_VITAL_THRESHOLDS.CRITICAL ? 'Com muita fome' : 'Com fome',
    )
  }

  if (
    pet.energy <= PET_VITAL_THRESHOLDS.LOW_WARNING &&
    canDo(pet, PetInteractionType.FEED)
  ) {
    return toRecommendation(PetInteractionType.FEED, 'Sem energia — um lanche ajuda')
  }

  if (pet.happiness <= 40 && canDo(pet, PetInteractionType.PLAY)) {
    return toRecommendation(PetInteractionType.PLAY, 'Precisa brincar')
  }

  if (pet.motivation <= 45 && canDo(pet, PetInteractionType.TRAIN)) {
    return toRecommendation(PetInteractionType.TRAIN, 'Hora de treinar')
  }

  if (canDo(pet, PetInteractionType.PET)) {
    return toRecommendation(PetInteractionType.PET, 'Melhor ação agora')
  }

  if (canDo(pet, PetInteractionType.TALK)) {
    return toRecommendation(PetInteractionType.TALK, 'Converse com seu pet')
  }

  return null
}
