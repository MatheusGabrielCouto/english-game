import { getPetDisplayInfo } from '@/features/pet/utils/display';
import type { Pet } from '@/types/pet';
import {
  InventoryCategory,
  LootBoxRarity,
  type InventoryLootBoxSnapshot,
  type InventoryPetSnapshot,
  type LootBoxRecord,
  type LootBoxRarityValue,
} from '@/types/inventory';

export const buildLootBoxSnapshot = (items: LootBoxRecord[]): InventoryLootBoxSnapshot => {
  const byRarity: Record<LootBoxRarityValue, number> = {
    [LootBoxRarity.COMMON]: 0,
    [LootBoxRarity.UNCOMMON]: 0,
    [LootBoxRarity.RARE]: 0,
    [LootBoxRarity.EPIC]: 0,
    [LootBoxRarity.LEGENDARY]: 0,
    [LootBoxRarity.MYTHIC]: 0,
    [LootBoxRarity.ANCIENT]: 0,
  };

  for (const item of items) {
    byRarity[item.rarity] += 1;
  }

  return {
    total: items.length,
    byRarity,
    items,
  };
};

export const buildPetSnapshot = (pet: Pet | null): InventoryPetSnapshot | null => {
  if (!pet) return null;

  const display = getPetDisplayInfo(pet);

  return {
    stage: pet.stage,
    stageLabel: display.stageLabel,
    level: display.level,
    mood: display.moodLabel,
    emoji: display.displayEmoji,
    name: display.name,
    speciesName: display.speciesName,
  };
};

export const isValidLootBoxRarity = (value: string): value is LootBoxRarityValue =>
  Object.values(LootBoxRarity).includes(value as LootBoxRarityValue);

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    [InventoryCategory.SHIELD]: 'Escudo',
    [InventoryCategory.LOOT_BOX]: 'Loot Box',
    [InventoryCategory.PET]: 'Pet',
    [InventoryCategory.SPECIAL]: 'Especial',
  };

  return labels[category] ?? category;
};
