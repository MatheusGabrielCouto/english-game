export type TitleDefinition = {
  key: string;
  name: string;
  description: string;
  requiredLevel: number;
  icon: string;
};

export type TitleUnlockRecord = {
  titleKey: string;
  unlockedAt: string;
  levelAtUnlock: number;
};

export type TitleAnalyticsRecord = {
  currentTitleKey: string;
  totalUnlocked: number;
  lastPromotionAt: string | null;
};

export type TitleProgress = {
  currentLevel: number;
  currentTitle: TitleDefinition;
  nextTitle: TitleDefinition | null;
  levelsUntilNext: number | null;
  progressLabel: string;
};

export type TitleViewModel = TitleDefinition & {
  unlockedAt: string | null;
  isActive: boolean;
};

export type TitleUnlockPayload = {
  title: TitleDefinition;
  unlockedAt: string;
  levelAtUnlock: number;
};

export type TitleSummary = {
  unlocked: number;
  total: number;
  currentTitleKey: string;
};
