import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildInsightCandidates,
  buildStatisticsInsights,
  getPrimaryStatisticsInsight,
  selectDailyStatisticsInsight,
} from '../insights'
import { hashDateKey } from '../daily-insight'

const baseDashboard = {
  overview: {
    totalStudyDays: 45,
    totalStudyTimeLabel: '15 horas',
    totalXp: 1000,
    currentLevel: 5,
    currentTitle: 'Developer',
    totalCoinsEarned: 500,
  },
  consistency: {
    currentStreak: 10,
    bestStreak: 32,
    totalStudyDays: 45,
    streaksProtected: 2,
    shieldsConsumed: 1,
  },
  quests: {
    dailyCompleted: 1,
    dailyTotal: 3,
    dailyCompletionRate: 33,
    weeklyCompleted: 3,
    weeklyTotal: 5,
    weeklyCompletionRate: 60,
  },
  pet: {
    stageLabel: 'Adult',
    stageEmoji: '🐦',
    level: 20,
    totalEvolutions: 3,
    averageMoodLabel: 'Bom',
    averageMoodScore: 70,
  },
  lootBoxes: {
    totalReceived: 5,
    totalOpened: 3,
    bestRewardLabel: '100 moedas',
    highestRarityLabel: 'Rara',
  },
  achievements: {
    unlocked: 8,
    total: 20,
    completionRate: 40,
    topCategoryLabel: 'Streak',
  },
  contracts: {
    totalAccepted: 4,
    totalCompleted: 3,
    successRate: 75,
    largestCompletedLabel: 'Weekly Focus',
  },
  city: {
    currentBuildingLabel: 'Office',
    currentBuildingEmoji: '🏢',
    totalUnlocked: 2,
    totalBuildings: 6,
    progressPercentage: 33,
  },
  insights: [],
  milestones: [],
}

describe('actionable statistics insights (P-24)', () => {
  it('returns exactly one daily insight', () => {
    const insights = buildStatisticsInsights(baseDashboard, '2026-06-05')
    assert.equal(insights.length, 1)
    assert.equal(insights[0]?.id, 'daily-quests-pending')
  })

  it('prioritizes daily quests with CTA', () => {
    const primary = getPrimaryStatisticsInsight(buildStatisticsInsights(baseDashboard))
    assert.equal(primary?.ctaLabel, 'Ir para missões')
    assert.equal(primary?.route, '/(tabs)/play')
  })

  it('surfaces loot when daily quests are done', () => {
    const insights = buildStatisticsInsights(
      {
        ...baseDashboard,
        quests: {
          dailyCompleted: 3,
          dailyTotal: 3,
          dailyCompletionRate: 100,
          weeklyCompleted: 3,
          weeklyTotal: 5,
          weeklyCompletionRate: 60,
        },
      },
      '2026-06-05',
    )

    assert.equal(insights[0]?.id, 'loot-unopened')
    assert.equal(insights[0]?.route, '/loot-boxes')
  })

  it('keeps same insight stable for a given date', () => {
    const candidates = buildInsightCandidates({
      ...baseDashboard,
      quests: {
        dailyCompleted: 3,
        dailyTotal: 3,
        dailyCompletionRate: 100,
        weeklyCompleted: 2,
        weeklyTotal: 5,
        weeklyCompletionRate: 40,
      },
    })

    const first = selectDailyStatisticsInsight(candidates, '2026-06-05')
    const second = selectDailyStatisticsInsight(candidates, '2026-06-05')
    assert.deepEqual(first, second)
  })

  it('hashDateKey is deterministic', () => {
    assert.equal(hashDateKey('2026-06-05'), hashDateKey('2026-06-05'))
    assert.notEqual(hashDateKey('2026-06-05'), hashDateKey('2026-06-06'))
  })
})
