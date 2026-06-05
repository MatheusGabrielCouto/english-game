import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildStatisticsInsights, getPrimaryStatisticsInsight } from '../insights'

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

describe('actionable statistics insights', () => {
  it('prioritizes daily quests with CTA', () => {
    const primary = getPrimaryStatisticsInsight(buildStatisticsInsights(baseDashboard))

    assert.equal(primary?.id, 'daily-quests-pending')
    assert.equal(primary?.ctaLabel, 'Ver missões')
    assert.equal(primary?.route, '/(tabs)/play')
  })

  it('surfaces loot when daily quests are done', () => {
    const insights = buildStatisticsInsights({
      ...baseDashboard,
      quests: {
        dailyCompleted: 3,
        dailyTotal: 3,
        dailyCompletionRate: 100,
        weeklyCompleted: 3,
        weeklyTotal: 5,
        weeklyCompletionRate: 60,
      },
    })

    assert.equal(insights[0]?.id, 'loot-unopened')
    assert.equal(insights[0]?.route, '/loot-boxes')
  })
})
