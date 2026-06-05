import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
    computeChildGeneration,
    getPetGenVisualTier,
    PET_GENERATION_MAX,
} from '../pet-generation';

describe('pet-generation', () => {
  it('returns GEN 1 when both parents are absent', () => {
    assert.equal(computeChildGeneration(null, null), 1);
    assert.equal(computeChildGeneration(undefined, undefined), 1);
  });

  it('uses max parent GEN + 1', () => {
    assert.equal(computeChildGeneration(4, 6), 7);
    assert.equal(computeChildGeneration(1, 1), 2);
  });

  it('caps at PET_GENERATION_MAX', () => {
    assert.equal(computeChildGeneration(PET_GENERATION_MAX, PET_GENERATION_MAX), PET_GENERATION_MAX);
  });

  it('maps visual tiers by milestone', () => {
    assert.equal(getPetGenVisualTier(1), 'base');
    assert.equal(getPetGenVisualTier(5), 'bronze');
    assert.equal(getPetGenVisualTier(10), 'silver');
    assert.equal(getPetGenVisualTier(25), 'gold');
    assert.equal(getPetGenVisualTier(50), 'mythic');
    assert.equal(getPetGenVisualTier(100), 'legacy');
  });
});
