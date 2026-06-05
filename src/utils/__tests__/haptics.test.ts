import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  BUTTON_HAPTIC_BY_VARIANT,
  HAPTIC_KIND_LABELS,
  PRESSABLE_SCALE_DEFAULT_HAPTIC,
  type HapticKind,
} from '@/constants/haptic-vocabulary'

const HAPTIC_KINDS: HapticKind[] = [
  'tap',
  'press',
  'confirm',
  'impact',
  'success',
  'warning',
  'error',
  'tab',
]

describe('haptic vocabulary', () => {
  it('documents every semantic kind', () => {
    for (const kind of HAPTIC_KINDS) {
      assert.ok(HAPTIC_KIND_LABELS[kind].length > 0)
    }
  })

  it('maps button variants to haptic kinds', () => {
    assert.equal(BUTTON_HAPTIC_BY_VARIANT.primary, 'confirm')
    assert.equal(BUTTON_HAPTIC_BY_VARIANT.secondary, 'press')
    assert.equal(BUTTON_HAPTIC_BY_VARIANT.ghost, 'tap')
    assert.equal(BUTTON_HAPTIC_BY_VARIANT.danger, 'warning')
  })

  it('defaults PressableScale to tap', () => {
    assert.equal(PRESSABLE_SCALE_DEFAULT_HAPTIC, 'tap')
  })
})
