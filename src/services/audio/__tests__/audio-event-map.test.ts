import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  AUDIO_SILENT_MODE_ALLOWLIST,
  EVENT_AUDIO_DOMAIN,
  GAME_EVENTS_WITH_AUDIO,
} from '@/constants/audio-sound-vocabulary'

import type { GameEvent } from '@/services/game-events'

import { resolveGameEventAudio } from '../audio-event-resolver'

const stubGameEvent = (type: (typeof GAME_EVENTS_WITH_AUDIO)[number]): GameEvent => {
  switch (type) {
    case 'XP_GAINED':
      return { type, amount: 10 }
    case 'LOCAL_MISSION_COMPLETED':
      return {
        type,
        poiKey: 'cafe',
        poiName: 'Café',
        missionTitle: 'Pedido',
        xpReward: 10,
        coinReward: 5,
        localXpReward: 2,
      }
    case 'ROUTINE_COMPLETED':
      return {
        type,
        routineId: '1',
        routineName: 'Rotina',
        category: 'study',
        frequency: 'daily',
        periodKey: '2026-06-05',
        xp: 10,
        coins: 5,
        studyPoints: 0,
        currentStreak: 1,
      }
    case 'LOOT_BOX_OPENED':
      return {
        type,
        result: {
          boxId: 1,
          boxRarity: 'common',
          reward: { type: 'coins', amount: 10, label: '10 moedas' },
        },
      }
    case 'FOCUS_SESSION_COMPLETED':
      return {
        type,
        sessionId: 1,
        rewards: {
          xp: 10,
          coins: 5,
          studyPoints: 0,
          bonusMultiplier: 1,
          lootBoxRarity: null,
          petAffinityGain: 0,
          focusRatio: 1,
        },
        focusedSeconds: 900,
        distractedSeconds: 0,
      }
    case 'CITY_BUILDING_UNLOCKED':
      return { type, buildingKey: 'library', buildingName: 'Biblioteca', levelAtUnlock: 3 }
    case 'DAILY_MISSION_COMPLETED':
      return { type, coinReward: 5 }
    default:
      return { type } as GameEvent
  }
}

describe('resolveGameEventAudio', () => {
  it('covers every documented game event with at least one plan', () => {
    for (const eventType of GAME_EVENTS_WITH_AUDIO) {
      const plans = resolveGameEventAudio(stubGameEvent(eventType))
      assert.ok(plans.length > 0, `missing audio plan for ${eventType}`)
    }
  })

  it('maps mission completion to mission_complete', () => {
    const plans = resolveGameEventAudio({
      type: 'WEEKLY_MISSION_CLAIMED',
    })
    assert.equal(plans[0]?.assetKey, 'mission_complete')
    assert.equal(plans[0]?.priority, 'high')
  })

  it('maps loot reveal by rarity', () => {
    const plans = resolveGameEventAudio({
      type: 'LOOT_BOX_OPENED',
      result: {
        boxId: 1,
        boxRarity: 'legendary',
        reward: { type: 'coins', amount: 50, label: '50 moedas' },
      },
    })
    assert.equal(plans[0]?.assetKey, 'loot_reveal_legendary')
    assert.equal(plans[0]?.priority, 'high')
  })

  it('maps city building unlock to level_up', () => {
    const plans = resolveGameEventAudio({
      type: 'CITY_BUILDING_UNLOCKED',
      buildingKey: 'library',
      buildingName: 'Biblioteca',
      levelAtUnlock: 5,
    })
    assert.equal(plans[0]?.assetKey, 'level_up')
    assert.equal(plans[0]?.family, 'city_unlock')
  })

  it('maps focus session completion with coins', () => {
    const plans = resolveGameEventAudio({
      type: 'FOCUS_SESSION_COMPLETED',
      sessionId: 1,
      rewards: {
        xp: 20,
        coins: 10,
        studyPoints: 0,
        bonusMultiplier: 1,
        lootBoxRarity: null,
        petAffinityGain: 0,
        focusRatio: 1,
      },
      focusedSeconds: 1500,
      distractedSeconds: 0,
    })
    assert.equal(plans[0]?.assetKey, 'study_day_stamp')
    assert.equal(plans[1]?.assetKey, 'coin_pickup')
  })

  it('assigns a domain label for every wired event', () => {
    for (const eventType of GAME_EVENTS_WITH_AUDIO) {
      assert.ok(EVENT_AUDIO_DOMAIN[eventType], `missing domain for ${eventType}`)
    }
  })

  it('keeps silent-mode allowlist inside wired events', () => {
    for (const eventType of AUDIO_SILENT_MODE_ALLOWLIST) {
      assert.ok(
        GAME_EVENTS_WITH_AUDIO.includes(eventType),
        `${eventType} must be wired before silent allowlist`,
      )
      const plans = resolveGameEventAudio(stubGameEvent(eventType))
      assert.ok(
        plans.some((plan) => plan.priority === 'high'),
        `${eventType} needs high priority for studySilentMode`,
      )
    }
  })
})
