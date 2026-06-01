export const LearningDifficulty = {
  CASUAL: 'casual',
  BALANCED: 'balanced',
  SERIOUS: 'serious',
  HARDCORE: 'hardcore',
} as const;

export type LearningDifficultyValue =
  (typeof LearningDifficulty)[keyof typeof LearningDifficulty];

export type DifficultyConfig = {
  label: string;
  description: string;
  targetMinutes: number;
  dailyMissionCount: number;
  weeklyMissionCount: number;
  xpMultiplier: number;
  coinMultiplier: number;
  contractStakeMultiplier: number;
  contractRewardMultiplier: number;
  lootBoxBonusChance: number;
  attributeGainMultiplier: number;
};

export const DIFFICULTY_CONFIG: Record<LearningDifficultyValue, DifficultyConfig> = {
  [LearningDifficulty.CASUAL]: {
    label: 'Casual',
    description: '15 min/dia · ritmo leve',
    targetMinutes: 15,
    dailyMissionCount: 3,
    weeklyMissionCount: 3,
    xpMultiplier: 0.75,
    coinMultiplier: 0.75,
    contractStakeMultiplier: 0.8,
    contractRewardMultiplier: 0.85,
    lootBoxBonusChance: 0,
    attributeGainMultiplier: 0.8,
  },
  [LearningDifficulty.BALANCED]: {
    label: 'Balanced',
    description: '30 min/dia · ritmo normal',
    targetMinutes: 30,
    dailyMissionCount: 4,
    weeklyMissionCount: 4,
    xpMultiplier: 1,
    coinMultiplier: 1,
    contractStakeMultiplier: 1,
    contractRewardMultiplier: 1,
    lootBoxBonusChance: 0.05,
    attributeGainMultiplier: 1,
  },
  [LearningDifficulty.SERIOUS]: {
    label: 'Serious',
    description: '60 min/dia · acelerado',
    targetMinutes: 60,
    dailyMissionCount: 5,
    weeklyMissionCount: 5,
    xpMultiplier: 1.25,
    coinMultiplier: 1.25,
    contractStakeMultiplier: 1.15,
    contractRewardMultiplier: 1.2,
    lootBoxBonusChance: 0.1,
    attributeGainMultiplier: 1.25,
  },
  [LearningDifficulty.HARDCORE]: {
    label: 'Hardcore',
    description: '90+ min/dia · preparação internacional',
    targetMinutes: 90,
    dailyMissionCount: 6,
    weeklyMissionCount: 6,
    xpMultiplier: 1.5,
    coinMultiplier: 1.5,
    contractStakeMultiplier: 1.35,
    contractRewardMultiplier: 1.45,
    lootBoxBonusChance: 0.15,
    attributeGainMultiplier: 1.5,
  },
};

export const DIFFICULTY_ORDER: LearningDifficultyValue[] = [
  LearningDifficulty.CASUAL,
  LearningDifficulty.BALANCED,
  LearningDifficulty.SERIOUS,
  LearningDifficulty.HARDCORE,
];

export const isLearningDifficulty = (value: string): value is LearningDifficultyValue =>
  DIFFICULTY_ORDER.includes(value as LearningDifficultyValue);

export const getDifficultyConfig = (difficulty: LearningDifficultyValue): DifficultyConfig =>
  DIFFICULTY_CONFIG[difficulty];
