export const PrestigeSacrificeType = {
  COINS: 'coins',
  PET: 'pet',
} as const;

export type PrestigeSacrificeValue = (typeof PrestigeSacrificeType)[keyof typeof PrestigeSacrificeType];

export type PrestigeAscensionFailureReason =
  | 'requirements'
  | 'active_contract'
  | 'invalid_sacrifice'
  | 'max_prestige';

export type PrestigeAscensionResult =
  | { success: true; tierLevel: number; tierName: string; tierRoman: string }
  | { success: false; reason: PrestigeAscensionFailureReason };

export type PrestigeAscensionPreview = {
  playerLevel: number;
  playerXp: number;
  coins: number;
  currentStreak: number;
  petLevel: number;
  petStage: string;
  petName: string;
};

export type PrestigeRewardItem = {
  key: string;
  name: string;
  icon: string;
  category: 'title' | 'frame' | 'avatar' | 'pet' | 'relic' | 'cosmetic' | 'loot_box' | 'coins';
};

export type PrestigePermanentBonus = {
  label: string;
  value: string;
};

export type PrestigeTierDefinition = {
  level: number;
  roman: string;
  name: string;
  subtitle: string;
  requiredPlayerLevel: number;
  exclusiveTitle: string;
  rewards: string[];
  permanentBonuses: PrestigePermanentBonus[];
  exclusiveItems: PrestigeRewardItem[];
  frameKey: string;
};
