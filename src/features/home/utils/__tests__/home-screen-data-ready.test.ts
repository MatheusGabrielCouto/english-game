import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isHomeScreenDataReady } from '../home-screen-data-ready'

const readySnapshot = {
  applicationHydrated: true,
  playerHydrated: true,
  missionsHydrated: true,
  missionsSyncing: false,
  routinesLoading: false,
  weeklyLoading: false,
  learningGpsHydrated: true,
  learningGpsSyncing: false,
  cityLoading: false,
  cityBuildingsCount: 3,
  cityMapLoading: false,
  contractsLoading: false,
  epicLoading: false,
  metagameLoading: false,
  petReady: true,
}

describe('isHomeScreenDataReady', () => {
  it('returns true when all home dependencies are ready', () => {
    assert.equal(isHomeScreenDataReady(readySnapshot), true)
  })

  it('blocks while learning gps is syncing', () => {
    assert.equal(
      isHomeScreenDataReady({
        ...readySnapshot,
        learningGpsSyncing: true,
      }),
      false,
    )
  })

  it('blocks while pet cache is missing', () => {
    assert.equal(
      isHomeScreenDataReady({
        ...readySnapshot,
        petReady: false,
      }),
      false,
    )
  })
})
