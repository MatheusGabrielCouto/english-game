import { ACHIEVEMENT_DEFINITIONS, CATEGORY_LABELS } from '@/features/achievements/constants/default-achievements';
import { computeLifetimeXp } from '@/features/achievements/utils/progress';
import { BUILDING_DEFINITIONS } from '@/features/city/constants/default-buildings';
import { resolveBuildingForLevel } from '@/features/city/utils/progress';
import { CONTRACTS_BY_KEY } from '@/features/contracts/constants/default-contracts';
import { buildAnalyticsSummary } from '@/features/contracts/utils/progress';
import { STAGE_CONFIG } from '@/features/pet/constants';
import { getLevelUpCoinReward } from '@/features/player/utils/xp';
import type { AchievementUnlockRecord } from '@/types/achievement';
import type { CityAnalyticsRecord } from '@/types/city';
import type { ContractAnalyticsRecord } from '@/types/contract';
import type { LootBoxAnalyticsRecord } from '@/types/loot-box';
import type { PetAnalyticsRecord } from '@/types/pet';
import type { Player, Stats } from '@/types/player';
import type { ShieldStatsRecord } from '@/types/shield';
import {
    StatisticsMilestoneCategory,
    type StatisticsDashboard,
    type StatisticsMilestoneCategoryValue,
    type StatisticsMilestoneRecord,
} from '@/types/statistics';

import {
    ESTIMATED_STUDY_MINUTES_PER_DAY,
    LOOT_RARITY_LABELS,
    LOOT_RARITY_ORDER,
} from '../constants/default-statistics';
import { formatNumber, formatPercentage, formatStudyTime, resolveStudyMinutes } from './formatters';
import { buildStatisticsInsights } from './insights';

type BuildDashboardParams = {
  player: Player & Stats;
  playerStudyMinutes: number;
  shieldStats: ShieldStatsRecord;
  missionStats: {
    dailyCompleted: number;
    dailyTotal: number;
    weeklyCompleted: number;
    weeklyTotal: number;
  };
  petAnalytics: PetAnalyticsRecord;
  petMoodLabel: string;
  lootBoxAnalytics: LootBoxAnalyticsRecord;
  achievementUnlocks: AchievementUnlockRecord[];
  contractAnalytics: ContractAnalyticsRecord;
  cityAnalytics: CityAnalyticsRecord;
  achievementAnalyticsCoins: number;
  milestones: StatisticsMilestoneRecord[];
};

export const computeTotalLevelUpCoins = (level: number): number => {
  let total = 0;

  for (let currentLevel = 2; currentLevel <= level; currentLevel += 1) {
    total += getLevelUpCoinReward(currentLevel);
  }

  return total;
};

export const computeTotalCoinsEarned = (params: {
  level: number;
  achievementCoins: number;
  lootBoxCoins: number;
  contractCoins: number;
}): number =>
  computeTotalLevelUpCoins(params.level) +
  params.achievementCoins +
  params.lootBoxCoins +
  params.contractCoins;

const getHighestLootRarityLabel = (analytics: LootBoxAnalyticsRecord): string | null => {
  const counts: Record<string, number> = {
    legendary: analytics.openedLegendary,
    epic: analytics.openedEpic,
    rare: analytics.openedRare,
    common: analytics.openedCommon,
  };

  for (const rarity of LOOT_RARITY_ORDER) {
    if ((counts[rarity] ?? 0) > 0) {
      return LOOT_RARITY_LABELS[rarity] ?? rarity;
    }
  }

  return null;
};

const getBestLootRewardLabel = (analytics: LootBoxAnalyticsRecord): string => {
  if (analytics.biggestCoinReward > 0) {
    return `${formatNumber(analytics.biggestCoinReward)} moedas`;
  }

  if (analytics.totalShieldsFromBoxes > 0) {
    return `${formatNumber(analytics.totalShieldsFromBoxes)} escudos`;
  }

  return '—';
};

const getTopAchievementCategoryLabel = (unlockedKeys: Set<string>): string | null => {
  const categoryTotals = new Map<string, { unlocked: number; total: number }>();

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    const current = categoryTotals.get(definition.category) ?? { unlocked: 0, total: 0 };
    current.total += 1;

    if (unlockedKeys.has(definition.key)) {
      current.unlocked += 1;
    }

    categoryTotals.set(definition.category, current);
  }

  let topCategory: string | null = null;
  let topRate = -1;

  for (const [category, stats] of categoryTotals.entries()) {
    if (stats.total <= 0) continue;

    const rate = stats.unlocked / stats.total;
    if (rate > topRate) {
      topRate = rate;
      topCategory = category;
    }
  }

  if (!topCategory) return null;

  return CATEGORY_LABELS[topCategory] ?? topCategory;
};

const getAverageMoodScore = (analytics: PetAnalyticsRecord): number => {
  const totalDays = analytics.positiveMoodDays + analytics.negativeMoodDays;
  if (totalDays <= 0) return 50;

  return Math.round((analytics.positiveMoodDays / totalDays) * 100);
};

const getAverageMoodLabel = (score: number): string => {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Baixo';
};

const getLargestContractLabel = (contractKey: string | null): string | null => {
  if (!contractKey) return null;
  return CONTRACTS_BY_KEY[contractKey]?.name ?? contractKey;
};

export const buildStatisticsDashboard = (params: BuildDashboardParams): StatisticsDashboard => {
  const {
    player,
    playerStudyMinutes,
    shieldStats,
    missionStats,
    petAnalytics,
    petMoodLabel,
    lootBoxAnalytics,
    achievementUnlocks,
    contractAnalytics,
    cityAnalytics,
    achievementAnalyticsCoins,
    milestones,
  } = params;

  const studyMinutes = resolveStudyMinutes(
    playerStudyMinutes,
    player.totalStudyDays,
    ESTIMATED_STUDY_MINUTES_PER_DAY,
  );

  const totalXp = computeLifetimeXp(player.level, player.xp);
  const totalCoinsEarned = computeTotalCoinsEarned({
    level: player.level,
    achievementCoins: achievementAnalyticsCoins,
    lootBoxCoins: lootBoxAnalytics.totalCoinsFromBoxes,
    contractCoins: contractAnalytics.totalCoinsWon,
  });

  const unlockedKeys = new Set(achievementUnlocks.map((item) => item.achievementKey));
  const achievementUnlocked = unlockedKeys.size;
  const achievementTotal = ACHIEVEMENT_DEFINITIONS.length;

  const contractSummary = buildAnalyticsSummary(contractAnalytics);
  const currentBuilding = resolveBuildingForLevel(player.level);
  const cityProgressPercentage = formatPercentage(cityAnalytics.totalUnlocked, BUILDING_DEFINITIONS.length);
  const averageMoodScore = getAverageMoodScore(petAnalytics);

  const dashboard: StatisticsDashboard = {
    overview: {
      totalStudyDays: player.totalStudyDays,
      totalStudyTimeLabel: formatStudyTime(studyMinutes),
      totalXp,
      currentLevel: player.level,
      currentTitle: player.title,
      totalCoinsEarned,
    },
    consistency: {
      currentStreak: player.currentStreak,
      bestStreak: player.bestStreak,
      totalStudyDays: player.totalStudyDays,
      streaksProtected: shieldStats.totalStreaksProtected,
      shieldsConsumed: shieldStats.totalConsumed,
    },
    quests: {
      dailyCompleted: missionStats.dailyCompleted,
      dailyTotal: missionStats.dailyTotal,
      dailyCompletionRate: formatPercentage(missionStats.dailyCompleted, missionStats.dailyTotal),
      weeklyCompleted: missionStats.weeklyCompleted,
      weeklyTotal: missionStats.weeklyTotal,
      weeklyCompletionRate: formatPercentage(missionStats.weeklyCompleted, missionStats.weeklyTotal),
    },
    pet: {
      stageLabel: STAGE_CONFIG[petAnalytics.currentStage].label,
      stageEmoji: STAGE_CONFIG[petAnalytics.currentStage].emoji,
      level: petAnalytics.currentLevel,
      totalEvolutions: petAnalytics.totalEvolutions,
      averageMoodLabel: petMoodLabel || getAverageMoodLabel(averageMoodScore),
      averageMoodScore,
    },
    lootBoxes: {
      totalReceived: lootBoxAnalytics.totalReceived,
      totalOpened: lootBoxAnalytics.totalOpened,
      bestRewardLabel: getBestLootRewardLabel(lootBoxAnalytics),
      highestRarityLabel: getHighestLootRarityLabel(lootBoxAnalytics),
    },
    achievements: {
      unlocked: achievementUnlocked,
      total: achievementTotal,
      completionRate: formatPercentage(achievementUnlocked, achievementTotal),
      topCategoryLabel: getTopAchievementCategoryLabel(unlockedKeys),
    },
    contracts: {
      totalAccepted: contractSummary.totalAccepted,
      totalCompleted: contractSummary.totalCompleted,
      successRate: contractSummary.successRate,
      largestCompletedLabel: getLargestContractLabel(contractSummary.largestContractCompletedKey),
    },
    city: {
      currentBuildingLabel: currentBuilding.name,
      currentBuildingEmoji: currentBuilding.icon,
      totalUnlocked: cityAnalytics.totalUnlocked,
      totalBuildings: BUILDING_DEFINITIONS.length,
      progressPercentage: cityProgressPercentage,
    },
    insights: [],
    milestones,
  };

  dashboard.insights = buildStatisticsInsights(dashboard);

  return dashboard;
};

export const buildMilestoneKey = (
  category: StatisticsMilestoneCategoryValue,
  key: string,
): string => `${category}:${key}`;

export { StatisticsMilestoneCategory };
