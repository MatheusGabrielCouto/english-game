import { pickDailyMotivationSpark } from '@/features/motivation-spark/utils/motivation-rotation'
import { getTodayKey } from '@/features/quests/utils/date'
import { GameEvents } from '@/services/game-events'
import { MotivationDailyPickRepository } from '@/storage/repositories/motivation-daily-pick-repository'
import { getMotivationSettings } from '@/storage/repositories/motivation-settings-repository'
import { MotivationSparkRepository } from '@/storage/repositories/motivation-spark-repository'
import type { MotivationDailyPickRecord, MotivationSparkRecord } from '@/types/motivation-spark'

export type MotivationDailySparkSnapshot = {
  dateKey: string
  pick: MotivationDailyPickRecord
  spark: MotivationSparkRecord
}

const pickAndPersist = async (dateKey: string): Promise<MotivationDailySparkSnapshot | null> => {
  const [sparks, settings] = await Promise.all([
    MotivationSparkRepository.listActive(),
    getMotivationSettings(),
  ])
  const recentPicks = await MotivationDailyPickRepository.listRecent(30)

  const chosen = pickDailyMotivationSpark({
    dateKey,
    sparks,
    recentPicks,
    avoidRepeatDays: settings.avoidRepeatDays,
  })

  if (!chosen) return null

  const now = new Date().toISOString()
  const pick: MotivationDailyPickRecord = {
    dateKey,
    sparkId: chosen.id,
    notifiedAt: null,
    eveningNotifiedAt: null,
    openedAt: null,
  }

  await MotivationDailyPickRepository.upsert(pick)
  await MotivationSparkRepository.update(chosen.id, {
    lastShownAt: now,
    showCount: chosen.showCount + 1,
    updatedAt: now,
  })

  const spark = await MotivationSparkRepository.findById(chosen.id)
  if (!spark) return null

  GameEvents.emit('MOTIVATION_DAILY_PICKED', { sparkId: spark.id, dateKey })

  return { dateKey, pick, spark }
}

export const MotivationDailyPickService = {
  async getDailySpark(dateKey = getTodayKey()): Promise<MotivationDailySparkSnapshot | null> {
    const existing = await MotivationDailyPickRepository.findByDateKey(dateKey)
    if (existing) {
      const spark = await MotivationSparkRepository.findById(existing.sparkId)
      if (spark && !spark.isArchived) {
        const snapshot = { dateKey, pick: existing, spark }
        void import('@/widgets/android/motivation-widget-snapshot').then(({ persistMotivationWidgetSnapshot }) =>
          persistMotivationWidgetSnapshot(spark),
        )
        return snapshot
      }
    }

    const picked = await pickAndPersist(dateKey)
    if (picked) {
      void import('@/widgets/android/motivation-widget-snapshot').then(({ persistMotivationWidgetSnapshot }) =>
        persistMotivationWidgetSnapshot(picked.spark),
      )
    }
    return picked
  },

  async markNotified(dateKey: string, notifiedAt = new Date().toISOString()): Promise<void> {
    const pick = await MotivationDailyPickRepository.findByDateKey(dateKey)
    if (!pick) return

    await MotivationDailyPickRepository.upsert({
      ...pick,
      notifiedAt,
    })
  },

  async markEveningNotified(
    dateKey: string,
    eveningNotifiedAt = new Date().toISOString(),
  ): Promise<void> {
    const pick = await MotivationDailyPickRepository.findByDateKey(dateKey)
    if (!pick) return

    await MotivationDailyPickRepository.upsert({
      ...pick,
      eveningNotifiedAt,
    })
  },

  async markOpenedForSpark(
    sparkId: string,
    openedAt = new Date().toISOString(),
  ): Promise<void> {
    const dateKey = getTodayKey()
    const pick = await MotivationDailyPickRepository.findByDateKey(dateKey)
    if (!pick || pick.sparkId !== sparkId || pick.openedAt) return

    await MotivationDailyPickRepository.markOpened(dateKey, openedAt)
    GameEvents.emit('MOTIVATION_SPARK_OPENED', { sparkId, dateKey })

    const { MotivationOpenStreakService } = await import('./motivation-open-streak-service')
    await MotivationOpenStreakService.refreshFromHistory()
  },
}
