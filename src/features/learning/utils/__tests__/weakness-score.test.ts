import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeWeaknessScore } from '../weakness-score';

describe('computeWeaknessScore', () => {
  it('returns higher weakness when recognition and retention are low', () => {
    const weak = computeWeaknessScore({
      recognitionScore: 0.1,
      grammarScore: 0.2,
      retentionScore: 0.1,
      transferScore: 0.2,
    });

    const strong = computeWeaknessScore({
      recognitionScore: 0.9,
      grammarScore: 0.8,
      retentionScore: 0.9,
      transferScore: 0.8,
    });

    assert.ok(weak > strong);
    assert.ok(weak >= 0.7);
    assert.ok(strong <= 0.3);
  });
});
