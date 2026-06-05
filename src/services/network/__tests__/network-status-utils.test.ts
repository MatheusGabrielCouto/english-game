import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { resolveIsOffline } from '../network-status-utils'

describe('resolveIsOffline', () => {
  it('detects offline when disconnected', () => {
    assert.equal(resolveIsOffline(false, true), true)
    assert.equal(resolveIsOffline(false, null), true)
  })

  it('detects offline when internet is unreachable', () => {
    assert.equal(resolveIsOffline(true, false), true)
  })

  it('stays online when connection is unknown but not false', () => {
    assert.equal(resolveIsOffline(null, null), false)
    assert.equal(resolveIsOffline(true, null), false)
    assert.equal(resolveIsOffline(true, true), false)
  })
})
