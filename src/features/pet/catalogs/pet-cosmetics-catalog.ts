import type { PetCosmeticDefinition, PetCosmeticSlot } from '@/types/pet-expansion';

const SLOTS: PetCosmeticSlot[] = ['hat', 'glasses', 'backpack', 'outfit', 'skin'];
const SLOT_LABELS: Record<PetCosmeticSlot, string> = {
  hat: 'Chapéu',
  glasses: 'Óculos',
  backpack: 'Mochila',
  outfit: 'Roupa',
  skin: 'Skin',
};
const SLOT_ICONS: Record<PetCosmeticSlot, string[]> = {
  hat: ['🎩', '🧢', '👒', '🪖', '🎓'],
  glasses: ['👓', '🕶️', '🥽', '🔍', '✨'],
  backpack: ['🎒', '💼', '🧳', '📦', '🎁'],
  outfit: ['👕', '🦺', '🧥', '👔', '🥋'],
  skin: ['🎨', '🌈', '✨', '💫', '🔥'],
};

const rarityForIndex = (index: number): PetCosmeticDefinition['rarity'] => {
  if (index >= 32) return 'legendary';
  if (index >= 24) return 'epic';
  if (index >= 12) return 'rare';
  return 'common';
};

export const PET_COSMETICS_CATALOG: PetCosmeticDefinition[] = Array.from({ length: 40 }, (_, index) => {
  const slot = SLOTS[index % SLOTS.length];
  const variant = Math.floor(index / SLOTS.length) + 1;
  const icons = SLOT_ICONS[slot];

  return {
    key: `cosmetic_${slot}_${variant}`,
    name: `${SLOT_LABELS[slot]} ${variant}`,
    icon: icons[index % icons.length],
    slot,
    rarity: rarityForIndex(index),
    minStage: index >= 24 ? 'teen' : index >= 12 ? 'baby' : 'egg',
  };
});

export const PET_COSMETICS_BY_KEY = Object.fromEntries(
  PET_COSMETICS_CATALOG.map((item) => [item.key, item]),
) as Record<string, PetCosmeticDefinition>;

export const getCosmeticsBySlot = (slot: PetCosmeticSlot): PetCosmeticDefinition[] =>
  PET_COSMETICS_CATALOG.filter((item) => item.slot === slot);
