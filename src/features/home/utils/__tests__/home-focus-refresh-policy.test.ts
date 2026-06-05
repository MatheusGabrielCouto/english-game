import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { HOME_FOCUS_REFRESH_TTL_MS } from '../../constants/home-focus-refresh-ui'
import {
  getStaleHomeFocusDomains,
  markHomeFocusDomainsRefreshed,
  shouldRefreshHomeFocusDomain,
} from '../home-focus-refresh-policy'

describe('home focus refresh policy (P-38)', () => {
  it('refreshes domain when never refreshed', () => {
    assert.equal(shouldRefreshHomeFocusDomain(undefined, 1_000), true)
  })

  it('skips refresh inside TTL window', () => {
    const now = 10_000
    assert.equal(shouldRefreshHomeFocusDomain(now - 5_000, now, HOME_FOCUS_REFRESH_TTL_MS), false)
  })

  it('refreshes again after TTL expires', () => {
    const now = 40_000
    const last = now - HOME_FOCUS_REFRESH_TTL_MS
    assert.equal(shouldRefreshHomeFocusDomain(last, now, HOME_FOCUS_REFRESH_TTL_MS), true)
  })

  it('returns only stale domains', () => {
    const now = 60_000
    const stamps = markHomeFocusDomainsRefreshed(
      markHomeFocusDomainsRefreshed({}, ['vault', 'pet'], now - 45_000),
      ['routines'],
      now - 5_000,
    )
    const stale = getStaleHomeFocusDomains(stamps, now)

    assert.ok(stale.includes('vault'))
    assert.ok(stale.includes('pet'))
    assert.ok(!stale.includes('routines'))
  })
})
