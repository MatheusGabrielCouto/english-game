import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { compareVersions, isVersionNewer } from '../changelog-version'
import { resolveChangelogEntryToShow, shouldSeedChangelogBaseline } from '../changelog-visibility'

describe('changelog visibility (P-21)', () => {
  it('compareVersions orders semver parts', () => {
    assert.equal(compareVersions('1.1.0', '1.0.0'), 1)
    assert.equal(compareVersions('1.0.0', '1.1.0'), -1)
    assert.equal(compareVersions('1.0.0', '1.0.0'), 0)
  })

  it('seeds baseline on first launch', () => {
    assert.equal(shouldSeedChangelogBaseline(null), true)
    assert.equal(shouldSeedChangelogBaseline('1.0.0'), false)
  })

  it('shows catalog entry only after version bump', () => {
    const entry = resolveChangelogEntryToShow({
      currentVersion: '1.1.0',
      lastSeenVersion: '1.0.0',
    })

    assert.equal(entry?.version, '1.1.0')
    assert.equal(entry?.title, 'Polish de experiência')
  })

  it('hides when already on same version', () => {
    assert.equal(
      resolveChangelogEntryToShow({
        currentVersion: '1.1.0',
        lastSeenVersion: '1.1.0',
      }),
      null,
    )
  })

  it('hides when catalog has no entry for target version', () => {
    assert.equal(
      resolveChangelogEntryToShow({
        currentVersion: '9.9.9',
        lastSeenVersion: '1.0.0',
      }),
      null,
    )
  })

  it('isVersionNewer helper', () => {
    assert.equal(isVersionNewer('1.1.0', '1.0.0'), true)
    assert.equal(isVersionNewer('1.0.0', '1.0.0'), false)
  })
})
