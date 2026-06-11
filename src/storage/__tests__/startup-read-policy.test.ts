import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  markApplicationStoresHydrated,
  resetApplicationHydrationForTests,
} from '../application-hydration'
import {
  isWithinStartupFocusGrace,
  shouldSkipHydratedStoreReread,
} from '../startup-read-policy'

describe('startup-read-policy', () => {
  it('does not skip before hydration', () => {
    resetApplicationHydrationForTests()
    assert.equal(shouldSkipHydratedStoreReread(true), false)
    assert.equal(isWithinStartupFocusGrace(), false)
  })

  it('skips mount read when store is ready after hydration', () => {
    resetApplicationHydrationForTests()
    markApplicationStoresHydrated()
    assert.equal(shouldSkipHydratedStoreReread(true), true)
    assert.equal(shouldSkipHydratedStoreReread(false), false)
  })

  it('skips focus read only within grace window', () => {
    resetApplicationHydrationForTests()
    markApplicationStoresHydrated()
    assert.equal(
      shouldSkipHydratedStoreReread(true, { withinFocusGrace: true }),
      true,
    )
  })
})
