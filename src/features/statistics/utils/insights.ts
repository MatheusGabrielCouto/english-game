import type { StatisticsDashboard, StatisticsInsight } from '@/types/statistics';
import { StatisticsMilestoneCategory } from '@/types/statistics';

import { formatNumber } from './formatters';

export const buildStatisticsInsights = (dashboard: StatisticsDashboard): StatisticsInsight[] => {
  const insights: StatisticsInsight[] = [];

  if (dashboard.overview.totalStudyDays > 0) {
    insights.push({
      id: 'consistency-days',
      category: StatisticsMilestoneCategory.STUDY,
      message: `Você estudou por ${formatNumber(dashboard.overview.totalStudyDays)} dias.`,
    });
  }

  if (dashboard.consistency.bestStreak > 0) {
    insights.push({
      id: 'best-streak',
      category: StatisticsMilestoneCategory.STREAK,
      message: `Sua maior streak é de ${formatNumber(dashboard.consistency.bestStreak)} dias.`,
    });
  }

  if (dashboard.contracts.totalCompleted > 0) {
    insights.push({
      id: 'contracts-completed',
      category: StatisticsMilestoneCategory.CONTRACT,
      message: `Você concluiu ${formatNumber(dashboard.contracts.totalCompleted)} desafios.`,
    });
  }

  if (dashboard.city.totalUnlocked > 0) {
    insights.push({
      id: 'city-growing',
      category: StatisticsMilestoneCategory.CITY,
      message: 'Sua cidade está crescendo.',
    });
  }

  if (dashboard.pet.stageLabel !== 'Ovo') {
    insights.push({
      id: 'pet-stage',
      category: StatisticsMilestoneCategory.PET,
      message: `Seu pet alcançou o estágio ${dashboard.pet.stageLabel}.`,
    });
  }

  if (dashboard.achievements.unlocked > 0) {
    insights.push({
      id: 'achievements-unlocked',
      category: StatisticsMilestoneCategory.ACHIEVEMENT,
      message: `${formatNumber(dashboard.achievements.unlocked)} conquistas desbloqueadas.`,
    });
  }

  if (dashboard.overview.totalStudyTimeLabel !== '0 min') {
    insights.push({
      id: 'study-time',
      category: 'general',
      message: `Tempo total de estudo: ${dashboard.overview.totalStudyTimeLabel}.`,
    });
  }

  return insights.slice(0, 6);
};
