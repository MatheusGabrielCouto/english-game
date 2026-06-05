import type { StatisticsInsight } from '@/types/statistics'

import { getTodayKey } from '@/features/quests/utils/date'

export type InsightCandidate = StatisticsInsight & { priority: number }

export const hashDateKey = (dateKey: string): number => {
  let hash = 0
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

/** Uma dica por dia — prioridade primeiro; empate quebra por data. */
export const selectDailyStatisticsInsight = (
  candidates: InsightCandidate[],
  dateKey: string = getTodayKey(),
): StatisticsInsight | null => {
  if (candidates.length === 0) return null

  const sorted = [...candidates].sort((a, b) => a.priority - b.priority)
  const bestPriority = sorted[0].priority
  const tier = sorted.filter((candidate) => candidate.priority === bestPriority)
  const index = hashDateKey(dateKey) % tier.length
  const { priority: _priority, ...insight } = tier[index]

  return insight
}

export const getPrimaryStatisticsInsight = (
  insights: StatisticsInsight[],
): StatisticsInsight | null => insights[0] ?? null
