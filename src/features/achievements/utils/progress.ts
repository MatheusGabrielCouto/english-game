import { STAGE_CONFIG, STAGE_ORDER } from '@/features/pet/constants';
import { getRequiredXP } from '@/features/player/utils/xp';
import type { PetStageValue } from '@/types/pet';
import {
  AchievementCategory,
  AchievementStatus,
  type AchievementDefinition,
  type AchievementMetricType,
  type AchievementProgress,
  type AchievementStatsRecord,
  type AchievementTarget,
} from '@/types/achievement';

export type AchievementMetricsSnapshot = {
  totalStudyDays: number;
  bestStreak: number;
  playerLevel: number;
  petStage: PetStageValue;
  stats: AchievementStatsRecord;
};

export const computeLifetimeXp = (level: number, currentXp: number): number => {
  let total = currentXp;
  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += getRequiredXP(currentLevel);
  }
  return total;
};

export const getStageIndex = (stage: PetStageValue): number => STAGE_ORDER.indexOf(stage);

export const resolveTargetValue = (target: AchievementTarget): number => {
  if (typeof target === 'number') return target;
  return getStageIndex(target);
};

export const getMetricValue = (
  metric: AchievementMetricType,
  snapshot: AchievementMetricsSnapshot,
): number => {
  switch (metric) {
    case 'total_study_days':
      return snapshot.totalStudyDays;
    case 'best_streak':
      return snapshot.bestStreak;
    case 'total_missions_completed':
      return snapshot.stats.totalMissionsCompleted;
    case 'total_xp_earned':
      return snapshot.stats.totalXpEarned;
    case 'player_level':
      return snapshot.playerLevel;
    case 'pet_stage':
      return getStageIndex(snapshot.petStage);
    case 'total_loot_boxes_opened':
      return snapshot.stats.totalLootBoxesOpened;
    case 'total_duel_wins':
      return snapshot.stats.totalDuelWins;
    case 'total_flash_reviews':
      return snapshot.stats.totalFlashReviews;
    default:
      return 0;
  }
};

const formatNumber = (value: number): string =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

const buildProgressLabel = (
  definition: AchievementDefinition,
  current: number,
  target: number,
): string => {
  switch (definition.category) {
    case AchievementCategory.STREAK:
      return `${formatNumber(current)} / ${formatNumber(target)} dias`;
    case AchievementCategory.MISSIONS:
      return `${formatNumber(current)} / ${formatNumber(target)} missões`;
    case AchievementCategory.XP:
      return `${formatNumber(current)} / ${formatNumber(target)} XP`;
    case AchievementCategory.LEVEL:
      return `Nível ${formatNumber(current)} / ${formatNumber(target)}`;
    case AchievementCategory.PET: {
      const currentStage = STAGE_ORDER[Math.max(current, 0)] ?? STAGE_ORDER[0];
      const targetStage =
        typeof definition.target === 'string' ? definition.target : STAGE_ORDER[target] ?? STAGE_ORDER[0];
      return `${STAGE_CONFIG[currentStage].label} → ${STAGE_CONFIG[targetStage].label}`;
    }
    case AchievementCategory.LOOT_BOXES:
      return `${formatNumber(current)} / ${formatNumber(target)} caixas`;
    default:
      return `${formatNumber(current)} / ${formatNumber(target)}`;
  }
};

export const buildAchievementProgress = (
  definition: AchievementDefinition,
  snapshot: AchievementMetricsSnapshot,
  unlockedAt: string | null,
): AchievementProgress => {
  const target = resolveTargetValue(definition.target);
  const current = getMetricValue(definition.metric, snapshot);
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const progressLabel = buildProgressLabel(definition, current, target);

  if (unlockedAt) {
    return {
      status: AchievementStatus.UNLOCKED,
      current,
      target,
      percentage: 100,
      progressLabel,
    };
  }

  if (current <= 0) {
    return {
      status: AchievementStatus.LOCKED,
      current,
      target,
      percentage,
      progressLabel,
    };
  }

  return {
    status: AchievementStatus.IN_PROGRESS,
    current,
    target,
    percentage,
    progressLabel,
  };
};

export const isAchievementMet = (
  definition: AchievementDefinition,
  snapshot: AchievementMetricsSnapshot,
): boolean => getMetricValue(definition.metric, snapshot) >= resolveTargetValue(definition.target);
