export const RpgAttribute = {
  INTELLIGENCE: 'intelligence',
  DISCIPLINE: 'discipline',
  COMMUNICATION: 'communication',
  CONFIDENCE: 'confidence',
  FLUENCY: 'fluency',
} as const;

export type RpgAttributeValue = (typeof RpgAttribute)[keyof typeof RpgAttribute];

export type PlayerRpgRecord = {
  intelligence: number;
  discipline: number;
  communication: number;
  confidence: number;
  fluency: number;
  unlockedPerks: string[];
  updatedAt: string;
};

export type RpgPerkDefinition = {
  key: string;
  name: string;
  description: string;
  requiredAttribute: RpgAttributeValue;
  requiredValue: number;
  bonusType: 'xp' | 'coins' | 'streak' | 'loot' | 'contract';
  bonusValue: number;
};

export const RPG_PERKS: RpgPerkDefinition[] = [
  { key: 'fast_learner', name: 'Fast Learner', description: '+5% XP', requiredAttribute: RpgAttribute.INTELLIGENCE, requiredValue: 10, bonusType: 'xp', bonusValue: 5 },
  { key: 'polyglot', name: 'Polyglot', description: '+5% Coins', requiredAttribute: RpgAttribute.FLUENCY, requiredValue: 10, bonusType: 'coins', bonusValue: 5 },
  { key: 'consistency_master', name: 'Consistency Master', description: '+1 Shield/mês', requiredAttribute: RpgAttribute.DISCIPLINE, requiredValue: 15, bonusType: 'streak', bonusValue: 1 },
  { key: 'interview_expert', name: 'Interview Expert', description: '+10% recompensa de contratos', requiredAttribute: RpgAttribute.CONFIDENCE, requiredValue: 12, bonusType: 'contract', bonusValue: 10 },
  { key: 'network_pro', name: 'Network Pro', description: '+5% Loot luck', requiredAttribute: RpgAttribute.COMMUNICATION, requiredValue: 12, bonusType: 'loot', bonusValue: 5 },
  { key: 'scholar', name: 'Scholar', description: '+8% XP', requiredAttribute: RpgAttribute.INTELLIGENCE, requiredValue: 20, bonusType: 'xp', bonusValue: 8 },
  { key: 'negotiator', name: 'Negotiator', description: '+8% Coins', requiredAttribute: RpgAttribute.CONFIDENCE, requiredValue: 20, bonusType: 'coins', bonusValue: 8 },
  { key: 'marathon_runner', name: 'Marathon Runner', description: '+15% XP em streaks', requiredAttribute: RpgAttribute.DISCIPLINE, requiredValue: 25, bonusType: 'xp', bonusValue: 15 },
];

export const RPG_ATTRIBUTE_LABELS: Record<RpgAttributeValue, string> = {
  [RpgAttribute.INTELLIGENCE]: 'Intelligence',
  [RpgAttribute.DISCIPLINE]: 'Discipline',
  [RpgAttribute.COMMUNICATION]: 'Communication',
  [RpgAttribute.CONFIDENCE]: 'Confidence',
  [RpgAttribute.FLUENCY]: 'Fluency',
};

export const DEFAULT_RPG_RECORD: PlayerRpgRecord = {
  intelligence: 1,
  discipline: 1,
  communication: 1,
  confidence: 1,
  fluency: 1,
  unlockedPerks: [],
  updatedAt: new Date().toISOString(),
};

export const ATTRIBUTE_GAIN_BY_CATEGORY: Record<string, RpgAttributeValue> = {
  vocabulary: RpgAttribute.INTELLIGENCE,
  reading: RpgAttribute.INTELLIGENCE,
  grammar: RpgAttribute.INTELLIGENCE,
  revision: RpgAttribute.DISCIPLINE,
  listening: RpgAttribute.FLUENCY,
  speaking: RpgAttribute.COMMUNICATION,
  writing: RpgAttribute.COMMUNICATION,
  career_english: RpgAttribute.CONFIDENCE,
  interview_english: RpgAttribute.CONFIDENCE,
  programming_english: RpgAttribute.INTELLIGENCE,
};
