import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { MentorRoleplayMode, MentorRoleplayRole } from '@/types/mentor-ai'

import { MentorRoleplayEngine } from '../mentor-roleplay-engine'

describe('MentorRoleplayEngine', () => {
  it('builds conversation opening for tourist role', () => {
    const opening = MentorRoleplayEngine.buildOpening(
      MentorRoleplayMode.CONVERSATION,
      MentorRoleplayRole.TOURIST,
      null,
    )

    assert.match(opening, /lost|airport|city center/i)
  })

  it('builds interview opening for frontend track', () => {
    const opening = MentorRoleplayEngine.buildOpening(
      MentorRoleplayMode.INTERVIEW,
      null,
      'frontend',
    )

    assert.match(opening, /React|state/i)
  })

  it('builds turn replies with tips', () => {
    const reply = MentorRoleplayEngine.buildTurnReply(
      MentorRoleplayMode.CONVERSATION,
      null,
      1,
      'I usually take the subway.',
    )

    assert.match(reply, /💬/)
    assert.match(reply, /💡/)
  })
})
