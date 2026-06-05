import type { StatisticsDashboard, StatisticsInsight } from '@/types/statistics'
import { StatisticsMilestoneCategory } from '@/types/statistics'

import { getTodayKey } from '@/features/quests/utils/date'

import {
  selectDailyStatisticsInsight,
  type InsightCandidate,
} from './daily-insight'

const INSIGHT_ROUTES = {
  home: '/',
  quests: '/(tabs)/play',
  lootBoxes: '/loot-boxes',
  pet: '/pet',
  city: '/city',
  achievements: '/achievements',
  contracts: '/contracts',
} as const

const pushInsight = (list: InsightCandidate[], insight: InsightCandidate | null) => {
  if (insight) list.push(insight)
}

export const buildInsightCandidates = (dashboard: StatisticsDashboard): InsightCandidate[] => {
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
          ? 'Falta só uma missão diária para fechar o dia com chave de ouro.'
          : `Ainda cabem ${dailyPending} missões hoje — um bloco curto no Jogar resolve.`,
      ctaLabel: 'Ir para missões',
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
          ? 'Tem uma caixa surpresa guardada — abra e celebre a recompensa.'
          : `${lootPending} caixas esperando no inventário. Vale uma pausa para abrir.`,
      ctaLabel: 'Abrir caixas',
      route: INSIGHT_ROUTES.lootBoxes,
    })
  }

  if (weeklyPending > 0 && quests.weeklyCompletionRate < 100) {
    pushInsight(candidates, {
      id: 'weekly-quests-pending',
      category: StatisticsMilestoneCategory.STUDY,
      priority: 3,
      message: `Missões da semana em ${quests.weeklyCompletionRate}% — ainda dá tempo de recuperar o ritmo.`,
      ctaLabel: 'Ver semana',
      route: INSIGHT_ROUTES.quests,
    })
  }

  if (pet.averageMoodScore < 55) {
    pushInsight(candidates, {
      id: 'pet-low-mood',
      category: StatisticsMilestoneCategory.PET,
      priority: 4,
      message: `Seu pet está ${pet.averageMoodLabel.toLowerCase()}. Um estudo rápido já anima a equipe.`,
      ctaLabel: 'Ver pet',
      route: INSIGHT_ROUTES.pet,
    })
  }

  if (city.progressPercentage < 100 && city.totalUnlocked < city.totalBuildings) {
    pushInsight(candidates, {
      id: 'city-progress',
      category: StatisticsMilestoneCategory.CITY,
      priority: 5,
      message: `A cidade quer crescer — estude para liberar ${city.currentBuildingLabel}.`,
      ctaLabel: 'Explorar cidade',
      route: INSIGHT_ROUTES.city,
    })
  }

  if (achievements.unlocked < achievements.total && achievements.completionRate < 90) {
    pushInsight(candidates, {
      id: 'achievements-near',
      category: StatisticsMilestoneCategory.ACHIEVEMENT,
      priority: 6,
      message: `${achievements.unlocked} de ${achievements.total} conquistas — o próximo troféu está perto.`,
      ctaLabel: 'Ver conquistas',
      route: INSIGHT_ROUTES.achievements,
    })
  }

  if (contracts.totalAccepted > contracts.totalCompleted) {
    pushInsight(candidates, {
      id: 'contracts-active',
      category: StatisticsMilestoneCategory.CONTRACT,
      priority: 7,
      message: 'Contrato em andamento — mantenha o ritmo para não perder o bônus.',
      ctaLabel: 'Ver contratos',
      route: INSIGHT_ROUTES.contracts,
    })
  }

  if (consistency.currentStreak > 0) {
    pushInsight(candidates, {
      id: 'streak-active',
      category: StatisticsMilestoneCategory.STREAK,
      priority: 8,
      message: `Sequência de ${consistency.currentStreak} dias — estude hoje para manter a chama acesa.`,
      ctaLabel: 'Voltar à Home',
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
}

/** Uma dica acionável por dia (feed, não dashboard). */
export const buildStatisticsInsights = (
  dashboard: StatisticsDashboard,
  dateKey: string = getTodayKey(),
): StatisticsInsight[] => {
  const daily = selectDailyStatisticsInsight(buildInsightCandidates(dashboard), dateKey)
  return daily ? [daily] : []
}

export { getPrimaryStatisticsInsight, selectDailyStatisticsInsight } from './daily-insight'
