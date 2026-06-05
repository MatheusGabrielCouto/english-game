import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  GAME_CARD_PRESS_GLOW,
  GAME_CARD_PRESS_SPRING,
  type GameCardVariant,
} from '../game-card-press-ui'

const VARIANTS: GameCardVariant[] = ['default', 'hero', 'quest', 'reward', 'danger']

describe('game-card press glow', () => {
  it('defines glow config for every variant', () => {
    for (const variant of VARIANTS) {
      const config = GAME_CARD_PRESS_GLOW[variant]
      assert.ok(config.ripple.startsWith('rgba('))
      assert.ok(config.border.startsWith('rgba('))
      assert.ok(config.rippleScaleTo > 1)
      assert.ok(config.borderOpacityTo > 0)
    }
  })

  it('uses strongest glow on hero cards', () => {
    assert.ok(
      GAME_CARD_PRESS_GLOW.hero.rippleScaleTo >= GAME_CARD_PRESS_GLOW.default.rippleScaleTo,
    )
    assert.ok(
      GAME_CARD_PRESS_GLOW.hero.borderOpacityTo >= GAME_CARD_PRESS_GLOW.default.borderOpacityTo,
    )
  })

  it('exposes spring tuning for press feedback', () => {
    assert.ok(GAME_CARD_PRESS_SPRING.damping > 0)
    assert.ok(GAME_CARD_PRESS_SPRING.stiffness > 0)
  })
})
