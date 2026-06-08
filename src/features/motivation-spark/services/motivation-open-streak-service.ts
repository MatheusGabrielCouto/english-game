import { AchievementStatsRepository } from '@/storage/repositories/achievement-stats-repository'
import { MotivationDailyPickRepository } from '@/storage/repositories/motivation-daily-pick-repository'
import { GameEvents } from '@/services/game-events'

import { computeMotivationOpenStreak } from '../utils/motivation-open-streak'

export const MotivationOpenStreakService = {
  async refreshFromHistory(): Promise<void> {
    const picks = await MotivationDailyPickRepository.listRecent(120)
    const streak = computeMotivationOpenStreak(picks)
    const stats = await AchievementStatsRepository.getOrCreate()

    const next = {
      ...stats,
      motivationOpenStreak: streak.current,
      bestMotivationOpenStreak: Math.max(stats.bestMotivationOpenStreak, streak.best),
      totalMotivationOpens: streak.totalOpens,
    }

    if (
      next.motivationOpenStreak !== stats.motivationOpenStreak ||
      next.bestMotivationOpenStreak !== stats.bestMotivationOpenStreak ||
      next.totalMotivationOpens !== stats.totalMotivationOpens
    ) {
      await AchievementStatsRepository.save(next)
      GameEvents.emit('MOTIVATION_OPEN_STREAK_UPDATED', {
        current: next.motivationOpenStreak,
        best: next.bestMotivationOpenStreak,
        totalOpens: next.totalMotivationOpens,
      })
    }
  },
}
