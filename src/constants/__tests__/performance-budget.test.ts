import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  HOME_TTI_BUDGET_MS,
  SPLASH_PERF_BUDGET,
  getSplashChainMs,
  isWithinHomeTtiBudget,
} from '../performance-budget'

describe('performance budget (P-34)', () => {
  it('defines home TTI budget at 1.5s post-hydration', () => {
    assert.equal(HOME_TTI_BUDGET_MS, 1500)
  })

  it('keeps splash chain within home TTI budget', () => {
    const chainMs = getSplashChainMs(SPLASH_PERF_BUDGET)
    assert.ok(chainMs <= HOME_TTI_BUDGET_MS, `splash chain ${chainMs}ms exceeds budget`)
  })

  it('evaluates budget compliance', () => {
    assert.equal(isWithinHomeTtiBudget(1200), true)
    assert.equal(isWithinHomeTtiBudget(1500), true)
    assert.equal(isWithinHomeTtiBudget(1501), false)
  })
})
