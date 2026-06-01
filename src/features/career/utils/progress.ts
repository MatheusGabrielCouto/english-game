import type {
  CareerDreamProgress,
  CareerInterviewProgress,
  CareerJobOfferProgress,
  CareerJourneyProgress,
  CareerProgressRecord,
} from '@/types/career';

import {
  CAREER_COMPANIES,
  CAREER_DREAMS,
  CAREER_INTERVIEWS,
  CAREER_JOB_OFFERS,
  CAREER_ROLES,
  COMPANIES_BY_KEY,
  ROLES_BY_KEY,
} from '../constants/career-catalog';

export const resolveRoleForLevel = (level: number) => {
  const eligible = CAREER_ROLES.filter((role) => level >= role.requiredLevel);
  return eligible[eligible.length - 1] ?? CAREER_ROLES[0];
};

export const buildCareerJourneyProgress = (
  level: number,
  record: CareerProgressRecord,
): CareerJourneyProgress => {
  const currentRole = ROLES_BY_KEY[record.currentRoleKey] ?? resolveRoleForLevel(level);
  const nextRole = CAREER_ROLES.find((role) => role.requiredLevel > level) ?? null;
  const currentCompany = COMPANIES_BY_KEY[record.currentCompanyKey] ?? CAREER_COMPANIES[0];
  const nextCompany =
    CAREER_COMPANIES.find(
      (company) =>
        company.requiredLevel > level && company.key !== record.currentCompanyKey,
    ) ?? null;

  return {
    currentRole,
    nextRole,
    levelsUntilNext: nextRole ? nextRole.requiredLevel - level : null,
    currentCompany,
    nextCompany,
    englishScore: record.englishScore,
    promotionsCount: record.promotionsCount,
  };
};

export const buildInterviewProgress = (
  level: number,
  englishScore: number,
  completedInterviews: string[],
): CareerInterviewProgress[] =>
  CAREER_INTERVIEWS.map((interview) => {
    const completed = completedInterviews.includes(interview.key);
    const progress = Math.min(englishScore, interview.targetCareerMissions);
    return {
      ...interview,
      completed,
      progress: level < interview.requiredLevel ? 0 : progress,
      target: interview.targetCareerMissions,
    };
  });

export const buildDreamProgress = (input: {
  currentStreak: number;
  coins: number;
  level: number;
  cityPercent: number;
  dreamProgress: Record<string, number>;
}): CareerDreamProgress[] =>
  CAREER_DREAMS.map((dream) => {
    let current = 0;
    switch (dream.metric) {
      case 'streak':
        current = input.currentStreak;
        break;
      case 'coins':
        current = input.coins;
        break;
      case 'city_percent':
        current = input.cityPercent;
        break;
      case 'level':
        current = input.level;
        break;
      default:
        current = input.dreamProgress[dream.key] ?? 0;
    }

    const percentage = dream.target > 0 ? Math.min(100, Math.round((current / dream.target) * 100)) : 0;
    return {
      ...dream,
      current,
      percentage,
      completed: current >= dream.target,
    };
  });

export const buildJobOfferProgress = (input: {
  level: number;
  englishScore: number;
  achievementsUnlocked: number;
  unlockedOffers: string[];
}): CareerJobOfferProgress[] =>
  CAREER_JOB_OFFERS.map((offer) => {
    const unlocked = input.unlockedOffers.includes(offer.key);
    const eligible =
      input.level >= offer.requiredLevel &&
      (offer.requiredEnglishScore === undefined || input.englishScore >= offer.requiredEnglishScore) &&
      (offer.requiredAchievements === undefined || input.achievementsUnlocked >= offer.requiredAchievements);

    return { ...offer, unlocked, eligible };
  });

export const isCompanyEligible = (
  company: (typeof CAREER_COMPANIES)[number],
  input: {
    level: number;
    currentStreak: number;
    currentRoleKey: string;
    achievementsUnlocked: number;
  },
): boolean => {
  if (input.level < company.requiredLevel) return false;
  if (company.requiredStreak && input.currentStreak < company.requiredStreak) return false;
  if (company.requiredRoleKey) {
    const requiredRole = ROLES_BY_KEY[company.requiredRoleKey];
    const currentRole = ROLES_BY_KEY[input.currentRoleKey as keyof typeof ROLES_BY_KEY];
    if (requiredRole && currentRole && currentRole.requiredLevel < requiredRole.requiredLevel) {
      return false;
    }
  }
  if (company.requiredAchievements && input.achievementsUnlocked < company.requiredAchievements) {
    return false;
  }
  return true;
};

export const resolveBestCompany = (
  input: {
    level: number;
    currentStreak: number;
    currentRoleKey: string;
    achievementsUnlocked: number;
  },
): (typeof CAREER_COMPANIES)[number] => {
  const eligible = CAREER_COMPANIES.filter((company) => isCompanyEligible(company, input));
  return eligible[eligible.length - 1] ?? CAREER_COMPANIES[0];
};
