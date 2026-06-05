import type { StatisticsDashboard, StatisticsInsight } from '@/types/statistics'

const INSIGHT_ROUTES = {
  home: '/',
  quests: '/(tabs)/play',
  lootBoxes: '/loot-boxes',
  pet: '/pet',
  city: '/city',
  achievements: '/achievements',
  contracts: '/contracts',
} as const
import { StatisticsMilestoneCategory } from '@/types/statistics'

type InsightCandidate = StatisticsInsight & { priority: number }

const pushInsight = (list: InsightCandidate[], insight: InsightCandidate | null) => {
  if (insight) list.push(insight)
}

export const buildStatisticsInsights = (dashboard: StatisticsDashboard): StatisticsInsight[] => {
  const candidates: InsightCandidate[] = []
  const { overview, consistency, quests, pet, lootBoxes, achievements, contracts, city } = dashboard

  const dailyPending = Math.max(0, quests.dailyTotal - quests.dailyCompleted)
  const weeklyPending = Math.max(0, quests.weeklyTotal - quests.weeklyCompleted)
  const lootPending = Math.max(0, lootBoxes.totalReceived - lootBoxes.totalOpened)

  if (dailyPending > 0) {
    pushInsight(candidates, {
      id: 'daily-quests-pending',
      category: StatisticsMilestoneCategory.STUDY,
      priority: 1,
      message:
        dailyPending === 1
          ? 'Falta 1 missão diária para fechar o dia com força.'
          : `Faltam ${dailyPending} missões diárias — um bloco curto resolve.`,
      ctaLabel: 'Ver missões',
      route: INSIGHT_ROUTES.quests,
    })
  }

  if (lootPending > 0) {
    pushInsight(candidates, {
      id: 'loot-unopened',
      category: StatisticsMilestoneCategory.LOOT_BOX,
      priority: 2,
      message:
        lootPending === 1
          ? 'Você tem 1 loot box fechada esperando recompensa.'
          : `${lootPending} loot boxes fechadas — abra antes que esqueça.`,
      ctaLabel: 'Abrir loot',
      route: INSIGHT_ROUTES.lootBoxes,
    })
  }

  if (weeklyPending > 0 && quests.weeklyCompletionRate < 100) {
    pushInsight(candidates, {
      id: 'weekly-quests-pending',
      category: StatisticsMilestoneCategory.STUDY,
      priority: 3,
      message: `Missões semanais em ${quests.weeklyCompletionRate}% — ainda dá para recuperar.`,
      ctaLabel: 'Missões da semana',
      route: INSIGHT_ROUTES.quests,
    })
  }

  if (pet.averageMoodScore < 55) {
    pushInsight(candidates, {
      id: 'pet-low-mood',
      category: StatisticsMilestoneCategory.PET,
      priority: 4,
      message: `Seu pet está ${pet.averageMoodLabel.toLowerCase()}. Um estudo rápido anima o time.`,
      ctaLabel: 'Cuidar do pet',
      route: INSIGHT_ROUTES.pet,
    })
  }

  if (city.progressPercentage < 100 && city.totalUnlocked < city.totalBuildings) {
    pushInsight(candidates, {
      id: 'city-progress',
      category: StatisticsMilestoneCategory.CITY,
      priority: 5,
      message: `Cidade em ${city.progressPercentage}% — estude para erguer ${city.currentBuildingLabel}.`,
      ctaLabel: 'Ver cidade',
      route: INSIGHT_ROUTES.city,
    })
  }

  if (achievements.unlocked < achievements.total && achievements.completionRate < 90) {
    pushInsight(candidates, {
      id: 'achievements-near',
      category: StatisticsMilestoneCategory.ACHIEVEMENT,
      priority: 6,
      message: `${achievements.unlocked}/${achievements.total} conquistas — falta pouco para o próximo marco.`,
      ctaLabel: 'Ver conquistas',
      route: INSIGHT_ROUTES.achievements,
    })
  }

  if (contracts.totalAccepted > contracts.totalCompleted) {
    pushInsight(candidates, {
      id: 'contracts-active',
      category: StatisticsMilestoneCategory.CONTRACT,
      priority: 7,
      message: 'Você tem contratos em andamento. Mantenha o ritmo para não perder o bônus.',
      ctaLabel: 'Ver contratos',
      route: INSIGHT_ROUTES.contracts,
    })
  }

  if (consistency.currentStreak > 0) {
    pushInsight(candidates, {
      id: 'streak-active',
      category: StatisticsMilestoneCategory.STREAK,
      priority: 8,
      message: `Sequência de ${consistency.currentStreak} dias — estude hoje para não quebrar.`,
      ctaLabel: 'Ir para Home',
      route: INSIGHT_ROUTES.home,
    })
  }

  if (candidates.length === 0) {
    pushInsight(candidates, {
      id: 'fallback-study',
      category: 'general',
      priority: 99,
      message:
        overview.totalStudyDays > 0
          ? `${overview.totalStudyDays} dias de jornada. Escolha a próxima missão e siga evoluindo.`
          : 'Comece com uma missão diária — o progresso aparece rápido aqui.',
      ctaLabel: 'Começar agora',
      route: INSIGHT_ROUTES.quests,
    })
  }

  return candidates
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(({ priority: _priority, ...insight }) => insight)
}

export const getPrimaryStatisticsInsight = (
  insights: StatisticsInsight[],
): StatisticsInsight | null => insights[0] ?? null
