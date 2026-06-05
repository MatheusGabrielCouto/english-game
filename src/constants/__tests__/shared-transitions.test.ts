import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  SHARED_TRANSITION_TAGS,
  SHARED_TRANSITION_TAG_VALUES,
} from '../shared-transitions-keys'

describe('shared transitions (P-28)', () => {
  it('uses unique tags for every hero pair', () => {
    assert.equal(
      new Set(SHARED_TRANSITION_TAG_VALUES).size,
      SHARED_TRANSITION_TAG_VALUES.length,
    )
  })

  it('defines city, pet farm and profile avatar pairs', () => {
    assert.equal(SHARED_TRANSITION_TAGS.cityBuildingHero, 'hero-city-building')
    assert.equal(SHARED_TRANSITION_TAGS.petFarmHero, 'hero-pet-farm')
    assert.equal(SHARED_TRANSITION_TAGS.profileAvatarHero, 'hero-profile-avatar')
  })
})
