import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PetTraitBonusService } from '../../services/pet-trait-bonus-service';
import { PetTraitRollService } from '../../services/pet-trait-roll-service';

describe('pet-trait-roll', () => {
  it('assigns slot count by species rarity', () => {
    assert.equal(PetTraitRollService.slotCountForSpecies('codeowl'), 1);
    assert.equal(PetTraitRollService.slotCountForSpecies('mergepenguin'), 2);
    assert.equal(PetTraitRollService.slotCountForSpecies('bugbee'), 3);
    assert.equal(PetTraitRollService.slotCountForSpecies('globalhawk'), 4);
  });

  it('rolls initial traits within slot cap', () => {
    const keys = PetTraitRollService.rollInitialTraits('globalhawk');
    assert.ok(keys.length >= 1 && keys.length <= 4);
    assert.equal(new Set(keys).size, keys.length);
  });

  it('aggregates global trait bonuses with cap', () => {
    const agg = PetTraitBonusService.aggregateFromTraitKeys([
      'study_addict',
      'golden_paw',
      'lazy',
    ]);
    assert.equal(agg.xp_percent, 5);
    assert.equal(agg.coin_percent, 15);
  });
});
