export const CareerRoleKey = {
  STUDENT: 'student',
  JUNIOR_DEVELOPER: 'junior_developer',
  REMOTE_DEVELOPER: 'remote_developer',
  SENIOR_DEVELOPER: 'senior_developer',
  INTERNATIONAL_DEVELOPER: 'international_developer',
  GLOBAL_ENGINEER: 'global_engineer',
  TECH_LEAD: 'tech_lead',
  CTO: 'cto',
} as const;

export type CareerRoleKeyValue = (typeof CareerRoleKey)[keyof typeof CareerRoleKey];

export const CareerCompanyKey = {
  STARTUP_LOCAL: 'startup_local',
  STARTUP_NATIONAL: 'startup_national',
  INTERNATIONAL_COMPANY: 'international_company',
  BIG_TECH: 'big_tech',
} as const;

export type CareerCompanyKeyValue = (typeof CareerCompanyKey)[keyof typeof CareerCompanyKey];

export const CareerEventType = {
  PROMOTION: 'promotion',
  INTERVIEW: 'interview',
  JOB_OFFER: 'job_offer',
  COMPANY: 'company',
  DREAM: 'dream',
} as const;

export type CareerEventTypeValue = (typeof CareerEventType)[keyof typeof CareerEventType];

export type CareerRole = {
  key: CareerRoleKeyValue;
  name: string;
  description: string;
  requiredLevel: number;
  icon: string;
};

export type CareerCompany = {
  key: CareerCompanyKeyValue;
  name: string;
  description: string;
  icon: string;
  requiredLevel: number;
  requiredStreak?: number;
  requiredRoleKey?: CareerRoleKeyValue;
  requiredAchievements?: number;
};

export type CareerInterview = {
  key: string;
  name: string;
  description: string;
  icon: string;
  requiredLevel: number;
  targetCareerMissions: number;
  rewardCoins: number;
  rewardXp: number;
};

export type CareerJobOffer = {
  key: string;
  name: string;
  companyKey: CareerCompanyKeyValue;
  description: string;
  icon: string;
  requiredLevel: number;
  requiredEnglishScore?: number;
  requiredAchievements?: number;
  salaryLabel: string;
};

export type CareerDream = {
  key: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  metric: 'streak' | 'coins' | 'city_percent' | 'level';
};

export type CareerProgressRecord = {
  currentRoleKey: CareerRoleKeyValue;
  currentCompanyKey: CareerCompanyKeyValue;
  englishScore: number;
  completedInterviews: string[];
  unlockedOffers: string[];
  dreamProgress: Record<string, number>;
  promotionsCount: number;
  updatedAt: string;
};

export type CareerEventRecord = {
  id: number;
  eventType: CareerEventTypeValue;
  eventKey: string;
  title: string;
  description: string;
  occurredAt: string;
};

export type CareerJourneyProgress = {
  currentRole: CareerRole;
  nextRole: CareerRole | null;
  levelsUntilNext: number | null;
  currentCompany: CareerCompany;
  nextCompany: CareerCompany | null;
  englishScore: number;
  promotionsCount: number;
};

export type CareerInterviewProgress = CareerInterview & {
  completed: boolean;
  progress: number;
  target: number;
};

export type CareerDreamProgress = CareerDream & {
  current: number;
  percentage: number;
  completed: boolean;
};

export type CareerJobOfferProgress = CareerJobOffer & {
  unlocked: boolean;
  eligible: boolean;
};
