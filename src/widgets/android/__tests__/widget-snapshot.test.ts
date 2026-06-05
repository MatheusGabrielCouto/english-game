import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldRefreshWidgetForDate } from '../widget-snapshot-utils'

test('shouldRefreshWidgetForDate detects day change', () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  assert.equal(shouldRefreshWidgetForDate(yesterday.toISOString()), true)
  assert.equal(shouldRefreshWidgetForDate(new Date().toISOString()), false)
})
