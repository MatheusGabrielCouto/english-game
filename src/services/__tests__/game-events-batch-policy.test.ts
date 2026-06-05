import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  appendGameEventToBatch,
  drainGameEventBatch,
  registerCoalescedTask,
  shouldScheduleGameEventFlush,
} from '../game-events-batch-policy'

describe('game events batch policy (P-43)', () => {
  it('schedules flush only once per burst', () => {
    assert.equal(shouldScheduleGameEventFlush(false), true)
    assert.equal(shouldScheduleGameEventFlush(true), false)
  })

  it('appends events to the pending batch', () => {
    const batch = appendGameEventToBatch([], { type: 'XP_GAINED', amount: 10 })
    const next = appendGameEventToBatch(batch, { type: 'STUDY_DAY_RECORDED' })

    assert.equal(batch.length, 1)
    assert.equal(next.length, 2)
    assert.equal(next[1]?.type, 'STUDY_DAY_RECORDED')
  })

  it('drains the batch for dispatch', () => {
    const pending = [{ type: 'XP_GAINED' as const, amount: 5 }]
    const drained = drainGameEventBatch(pending)

    assert.deepEqual(drained.events, pending)
    assert.deepEqual(drained.next, [])
  })

  it('dedupes coalesced tasks by reference', () => {
    const refresh = () => undefined
    const once = registerCoalescedTask(new Set(), refresh)
    const twice = registerCoalescedTask(once, refresh)

    assert.equal(once.size, 1)
    assert.equal(twice.size, 1)
  })
})
