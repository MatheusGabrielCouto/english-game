import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PunishmentSeverity, PunishmentTrigger } from '@/types/punishment';

import { aggregatePenalties, filterExpiredPenalties } from '../aggregate-penalties';

describe('aggregatePenalties', () => {
  it('returns neutral values when no penalties are active', () => {
    const result = aggregatePenalties([]);
    assert.equal(result.hasActivePenalties, false);
    assert.equal(result.cityVibrancy, 100);
    assert.equal(result.xpDecayPercent, 0);
  });

  it('stacks light penalties up to configured caps', () => {
    const penalty = {
      id: '1',
      trigger: PunishmentTrigger.STREAK_BROKEN,
      severity: PunishmentSeverity.LIGHT,
      xpDecayPercent: 5,
      coinDecayPercent: 5,
      lootLuckReduction: 3,
      contractPenalty: false,
      petMoodOverride: null,
      cityVibrancy: 78,
      appliedAt: new Date().toISOString(),
      expiresAt: null,
    };

    const result = aggregatePenalties([penalty, penalty]);
    assert.equal(result.xpDecayPercent, 10);
    assert.equal(result.cityVibrancy, 78);
    assert.equal(result.hasActivePenalties, true);
  });

  it('drops expired penalties', () => {
    const expired = {
      id: '1',
      trigger: PunishmentTrigger.FOCUS_ABANDONED,
      severity: PunishmentSeverity.LIGHT,
      xpDecayPercent: 5,
      coinDecayPercent: 5,
      lootLuckReduction: 3,
      contractPenalty: false,
      petMoodOverride: null,
      cityVibrancy: 78,
      appliedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };

    assert.equal(filterExpiredPenalties([expired]).length, 0);
  });
});
