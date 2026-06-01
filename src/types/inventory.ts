export const InventoryCategory = {
  SHIELD: 'shield',
  LOOT_BOX: 'loot_box',
  PET: 'pet',
  SPECIAL: 'special',
} as const;

export type InventoryCategoryValue =
  (typeof InventoryCategory)[keyof typeof InventoryCategory];

export const LootBoxRarity = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic',
  ANCIENT: 'ancient',
} as const;

export type LootBoxRarityValue = (typeof LootBoxRarity)[keyof typeof LootBoxRarity];

export type InventoryAcquisitionSource =
  | 'streak'
  | 'milestone'
  | 'achievement'
  | 'contract'
  | 'loot_box'
  | 'shop'
  | 'event'
  | 'pet'
  | 'system'
  | 'study_points'
  | 'prestige'
  | 'bonus'
  | 'level_milestone'
  | 'sp_upgrade'
  | 'weekly_bonus'
  | 'focus_mode'
  | 'punishment_recovery';

export type LootBoxRecord = {
  id: number;
  rarity: LootBoxRarityValue;
  source: string;
  acquiredAt: string;
  opened: boolean;
};

export type SpecialItemRecord = {
  id: number;
  itemKey: string;
  quantity: number;
  source: string;
  acquiredAt: string;
};

export type AcquisitionHistoryRecord = {
  id: number;
  category: InventoryCategoryValue;
  itemKey: string;
  quantity: number;
  message: string;
  source: string;
  acquiredAt: string;
};

export type InventoryAnalyticsRecord = {
  totalItemsAcquired: number;
  totalShieldsReceived: number;
  totalLootBoxesReceived: number;
  totalSpecialItemsReceived: number;
  lastUpdatedAt: string | null;
};

export type InventoryShieldSnapshot = {
  quantity: number;
};

export type InventoryPetSnapshot = {
  stage: string;
  stageLabel: string;
  level: number;
  mood: string;
  emoji: string;
  name: string;
  speciesName: string;
};

export type InventoryLootBoxSnapshot = {
  total: number;
  byRarity: Record<LootBoxRarityValue, number>;
  items: LootBoxRecord[];
};

export type InventorySnapshot = {
  shields: InventoryShieldSnapshot;
  lootBoxes: InventoryLootBoxSnapshot;
  pet: InventoryPetSnapshot | null;
  specialItems: SpecialItemRecord[];
  analytics: InventoryAnalyticsRecord;
};
