export const CollectibleCategory = {
  RELIC: 'relic',
  ARTIFACT: 'artifact',
  MYTHIC: 'mythic',
  COSMETIC: 'cosmetic',
  PET_EXCLUSIVE: 'pet_exclusive',
  ULTRA_RARE: 'ultra_rare',
} as const;

export type CollectibleCategoryValue =
  (typeof CollectibleCategory)[keyof typeof CollectibleCategory];

export const CollectibleRarity = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic',
  ANCIENT: 'ancient',
} as const;

export type CollectibleRarityValue =
  (typeof CollectibleRarity)[keyof typeof CollectibleRarity];

export type CollectibleDefinition = {
  key: string;
  name: string;
  description: string;
  category: CollectibleCategoryValue;
  rarity: CollectibleRarityValue;
  icon: string;
  passiveBonus?: string;
  ultraRare?: boolean;
};

export type CollectionBookEntry = {
  itemKey: string;
  category: CollectibleCategoryValue;
  rarity: CollectibleRarityValue;
  discoveredAt: string;
};
