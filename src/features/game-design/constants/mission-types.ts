export const MissionCategory = {
  VOCABULARY: 'vocabulary',
  READING: 'reading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  WRITING: 'writing',
  GRAMMAR: 'grammar',
  REVISION: 'revision',
  CAREER: 'career_english',
  INTERVIEW: 'interview_english',
  PROGRAMMING: 'programming_english',
} as const;

export type MissionCategoryValue = (typeof MissionCategory)[keyof typeof MissionCategory];

export const MissionDifficultyTier = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const;

export type MissionDifficultyTierValue =
  (typeof MissionDifficultyTier)[keyof typeof MissionDifficultyTier];

export const CATEGORY_LABELS: Record<MissionCategoryValue, string> = {
  [MissionCategory.VOCABULARY]: 'Vocabulary',
  [MissionCategory.READING]: 'Reading',
  [MissionCategory.LISTENING]: 'Listening',
  [MissionCategory.SPEAKING]: 'Speaking',
  [MissionCategory.WRITING]: 'Writing',
  [MissionCategory.GRAMMAR]: 'Grammar',
  [MissionCategory.REVISION]: 'Revision',
  [MissionCategory.CAREER]: 'Career English',
  [MissionCategory.INTERVIEW]: 'Interview English',
  [MissionCategory.PROGRAMMING]: 'Programming English',
};

export const CATEGORY_ICONS: Record<MissionCategoryValue, string> = {
  [MissionCategory.VOCABULARY]: '📚',
  [MissionCategory.READING]: '📖',
  [MissionCategory.LISTENING]: '🎧',
  [MissionCategory.SPEAKING]: '🎤',
  [MissionCategory.WRITING]: '✍️',
  [MissionCategory.GRAMMAR]: '📝',
  [MissionCategory.REVISION]: '🔄',
  [MissionCategory.CAREER]: '💼',
  [MissionCategory.INTERVIEW]: '🎯',
  [MissionCategory.PROGRAMMING]: '💻',
};

export const DIFFICULTY_TIER_MULTIPLIERS: Record<MissionDifficultyTierValue, { xp: number; coins: number }> = {
  [MissionDifficultyTier.EASY]: { xp: 1, coins: 1 },
  [MissionDifficultyTier.MEDIUM]: { xp: 1.35, coins: 1.25 },
  [MissionDifficultyTier.HARD]: { xp: 1.75, coins: 1.5 },
  [MissionDifficultyTier.EXPERT]: { xp: 2.25, coins: 1.85 },
};

export const MISSION_CATEGORY_ORDER: MissionCategoryValue[] = Object.values(MissionCategory);
