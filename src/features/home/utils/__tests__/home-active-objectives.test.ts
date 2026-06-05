import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { HomeActiveObjectivesInput } from '../home-active-objectives'
import {
  buildHomeActiveObjectives,
  countHomeActiveObjectives,
  HOME_ACTIVE_OBJECTIVES_LIMIT,
} from '../home-active-objectives'

const baseInput: HomeActiveObjectivesInput = {
  missions: [
    {
      id: '1',
      title: 'Study',
      description: '',
      xpReward: 10,
      coinReward: 5,
      completed: false,
    },
    {
      id: '2',
      title: 'Read',
      description: '',
      xpReward: 10,
      coinReward: 5,
      completed: true,
    },
  ],
  dueToday: [
    {
      routine: {
        id: 'r1',
        name: 'English Class',
        description: null,
        category: 'english_course',
        frequency: 'daily',
        reminderTime: null,
        weekdays: [],
        expectedDurationMin: null,
        customXp: null,
        customCoins: null,
        templateKey: null,
        isArchived: false,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      stats: {
        routineId: 'r1',
        totalCompleted: 0,
        totalMissed: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedPeriod: null,
        updatedAt: '2026-01-01',
      },
      periodKey: '2026-06-05',
      completed: false,
      isDueToday: true,
    },
  ],
  weeklyMissions: [
    {
      id: 'w1',
      title: 'Weekly',
      description: '',
      missionType: 'study_sessions',
      targetValue: 3,
      currentValue: 3,
      completed: true,
      claimed: false,
      xpReward: 50,
      coinReward: 20,
      weekStartDate: '2026-06-02',
      weekEndDate: '2026-06-08',
      createdAt: '2026-06-02',
    },
  ],
  activeContract: {
    id: 1,
    contractKey: 'c1',
    issuerPoiKey: 'poi',
    status: 'active' as const,
    targetDays: 7,
    progressDays: 2,
    stakeAmount: 100,
    startedAt: '2026-01-01',
    endedAt: null,
    lastProgressAt: null,
    name: '7 dias de foco',
    description: '',
    objective: '',
    icon: '📜',
    rewards: [],
    daysRemaining: 5,
    issuerPoiName: 'Bank',
    issuerPoiIcon: '🏦',
  },
  unopenedLoot: 2,
  epicMissions: [],
  claimableSeasonTiers: 1,
}

describe('buildHomeActiveObjectives', () => {
  it('prioritizes actionable objectives and caps the list', () => {
    const objectives = buildHomeActiveObjectives(baseInput)

    assert.equal(objectives.length, HOME_ACTIVE_OBJECTIVES_LIMIT)
    assert.equal(objectives[0]?.id, 'daily-missions')
    assert.equal(objectives[1]?.id, 'routines-today')
    assert.equal(objectives[2]?.id, 'weekly-claimable')
    assert.equal(objectives[3]?.id, 'active-contract')
  })

  it('counts all active objectives beyond the visible limit', () => {
    assert.equal(countHomeActiveObjectives(baseInput), 6)
  })

  it('returns empty when nothing needs action', () => {
    const objectives = buildHomeActiveObjectives({
      missions: baseInput.missions.map((mission) => ({ ...mission, completed: true })),
      dueToday: baseInput.dueToday.map((item) => ({ ...item, completed: true })),
      weeklyMissions: baseInput.weeklyMissions.map((mission) => ({ ...mission, claimed: true })),
      activeContract: null,
      unopenedLoot: 0,
      epicMissions: [],
      claimableSeasonTiers: 0,
    })

    assert.equal(objectives.length, 0)
  })
})
