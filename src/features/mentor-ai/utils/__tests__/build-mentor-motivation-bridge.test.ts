import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    buildMentorMotivationBridge,
    resolveMotivationSparkRoute,
} from '../build-mentor-motivation-bridge'

describe('buildMentorMotivationBridge', () => {
  it('nudges user to open daily spark when not opened', () => {
    const bridge = buildMentorMotivationBridge({
      dailySpark: {
        dateKey: '2026-06-08',
        pick: {
          dateKey: '2026-06-08',
          sparkId: 'spark-1',
          notifiedAt: null,
          eveningNotifiedAt: null,
          openedAt: null,
        },
        spark: {
          id: 'spark-1',
          title: 'Disciplina vence talento',
          body: 'Cada dia conta no seu inglês.',
          contentKind: 'text',
          images: [],
          audioUri: null,
          audioDurationMs: null,
          audioTranscript: null,
          links: [],
          collectionId: null,
          tags: [],
          importance: 'medium',
          isFavorite: false,
          isArchived: false,
          showCount: 1,
          lastShownAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      openStreak: 4,
      weakestSkillLabel: 'conversação',
    })

    assert.equal(bridge.dailySparkTitle, 'Disciplina vence talento')
    assert.equal(bridge.openedToday, false)
    assert.match(bridge.coachMessage, /Chama de hoje/)
    assert.equal(resolveMotivationSparkRoute(bridge), '/motivation/spark-1')
  })
})
