import { PetInteractionType, type PetInteractionTypeValue } from '@/types/pet-expansion'

export type PetInteractionMeta = {
  type: PetInteractionTypeValue
  label: string
  emoji: string
}

export const PET_INTERACTION_CATALOG: PetInteractionMeta[] = [
  { type: PetInteractionType.PET, label: 'Carinho', emoji: '🤲' },
  { type: PetInteractionType.FEED, label: 'Alimentar', emoji: '🍎' },
  { type: PetInteractionType.PLAY, label: 'Brincar', emoji: '🎾' },
  { type: PetInteractionType.TALK, label: 'Conversar', emoji: '💬' },
  { type: PetInteractionType.TRAIN, label: 'Treinar', emoji: '📖' },
  { type: PetInteractionType.GIFT, label: 'Presente', emoji: '🎁' },
  { type: PetInteractionType.PHOTO, label: 'Foto', emoji: '📸' },
  { type: PetInteractionType.ACCESSORY, label: 'Acessório', emoji: '👒' },
]

export const PET_INTERACTION_BY_TYPE = Object.fromEntries(
  PET_INTERACTION_CATALOG.map((item) => [item.type, item]),
) as Record<PetInteractionTypeValue, PetInteractionMeta>
