import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  HOW_IT_WORKS_SCREEN_KEYS,
  howItWorksStorageKey,
  type HowItWorksScreenKey,
} from '../how-it-works-seen-keys'

describe('useHowItWorksSeen (P-27)', () => {
  it('defines a unique storage key per screen', () => {
    const keys = HOW_IT_WORKS_SCREEN_KEYS.map(howItWorksStorageKey)
    assert.equal(new Set(keys).size, HOW_IT_WORKS_SCREEN_KEYS.length)
  })

  it('covers vault hubs and legacy how-it-works cards', () => {
    const required: HowItWorksScreenKey[] = [
      'achievements',
      'city',
      'collection-book',
      'contracts',
      'prestige',
      'shields',
      'titles',
      'vault-library',
      'vault-map',
      'vault-spaces',
      'vault-collections',
    ]

    for (const key of required) {
      assert.ok(HOW_IT_WORKS_SCREEN_KEYS.includes(key))
      assert.match(howItWorksStorageKey(key), /^eq:how-it-works-seen:/)
    }
  })
})
