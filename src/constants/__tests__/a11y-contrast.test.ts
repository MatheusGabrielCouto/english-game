import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  contrastRatio,
  meetsWcagAaNormalText,
  WCAG_AA_NORMAL_TEXT,
} from '@/utils/contrast-ratio'

import {
  CARD_A11Y_SURFACES,
  CARD_A11Y_TEXT,
  LEGACY_MUTED_COLOR,
} from '../a11y-contrast'

describe('card contrast audit (P-14)', () => {
  it('elevated muted passes WCAG AA on card surfaces', () => {
    for (const surface of Object.values(CARD_A11Y_SURFACES)) {
      assert.ok(
        meetsWcagAaNormalText(CARD_A11Y_TEXT.muted, surface),
        `muted on ${surface} should be >= ${WCAG_AA_NORMAL_TEXT}:1`,
      )
    }
  })

  it('legacy muted fails on surface', () => {
    assert.ok(
      contrastRatio(LEGACY_MUTED_COLOR, CARD_A11Y_SURFACES.surface) < WCAG_AA_NORMAL_TEXT,
    )
  })

  it('foreground tokens pass on card surfaces', () => {
    for (const surface of Object.values(CARD_A11Y_SURFACES)) {
      assert.ok(meetsWcagAaNormalText(CARD_A11Y_TEXT.foreground, surface))
      assert.ok(meetsWcagAaNormalText(CARD_A11Y_TEXT.foregroundSecondary, surface))
    }
  })

  it('brand accents pass on surface for badges', () => {
    assert.ok(meetsWcagAaNormalText(CARD_A11Y_TEXT.primary, CARD_A11Y_SURFACES.surface))
    assert.ok(meetsWcagAaNormalText(CARD_A11Y_TEXT.success, CARD_A11Y_SURFACES.surface))
  })
})
