import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { MENTOR_CHAT_CONTEXT_LIMIT, truncateChatMessages } from '../truncate-chat-messages'

describe('truncateChatMessages', () => {
  it('keeps only the latest messages up to the limit', () => {
    const messages = Array.from({ length: 20 }, (_, index) => ({
      id: `m${index}`,
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `msg ${index}`,
      createdAt: '2026-01-01',
    }))

    const truncated = truncateChatMessages(messages)
    assert.equal(truncated.length, MENTOR_CHAT_CONTEXT_LIMIT)
    assert.equal(truncated[0]?.content, 'msg 8')
  })

  it('drops system messages from context window', () => {
    const truncated = truncateChatMessages([
      { id: 's1', role: 'system', content: 'sys', createdAt: '2026-01-01' },
      { id: 'u1', role: 'user', content: 'hi', createdAt: '2026-01-01' },
    ])

    assert.equal(truncated.length, 1)
    assert.equal(truncated[0]?.role, 'user')
  })
})
