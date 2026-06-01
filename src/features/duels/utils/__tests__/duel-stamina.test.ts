import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUEL_PROGRESSION_CONFIG } from '../../constants/duel-progression-config';
import { computeStaminaAfterRegen } from '../duel-stamina';

describe('computeStaminaAfterRegen', () => {
  it('never returns negative stamina', () => {
    const result = computeStaminaAfterRegen(-1, '2020-01-01T00:00:00.000Z', new Date('2020-01-01T12:00:00.000Z'));
    assert.ok(result.stamina >= 0);
  });

  it('caps at max stamina', () => {
    const now = new Date('2026-06-01T12:00:00.000Z');
    const result = computeStaminaAfterRegen(3, '2026-06-01T00:00:00.000Z', now);
    assert.ok(result.stamina <= DUEL_PROGRESSION_CONFIG.maxStamina);
    assert.equal(result.stamina, DUEL_PROGRESSION_CONFIG.maxStamina);
  });

  it('regenerates 1 stamina per 4 hours', () => {
    const start = new Date('2026-06-01T00:00:00.000Z');
    const later = new Date('2026-06-01T08:00:00.000Z');
    const result = computeStaminaAfterRegen(2, start.toISOString(), later);
    assert.equal(result.stamina, 4);
  });
});
