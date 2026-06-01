import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUEL_PROGRESSION_CONFIG } from '../../constants/duel-progression-config';
import { usesA1TravelPack } from '../../constants/duel-progression-config';
import { DuelPatentService } from '../duel-patent-service';

describe('DuelPatentService', () => {
  it('passes exam at 80% or higher', () => {
    const total = DUEL_PROGRESSION_CONFIG.patentExamQuestionCount;
    const needed = Math.ceil(total * DUEL_PROGRESSION_CONFIG.patentExamPassRatio);
    assert.equal(DuelPatentService.isExamPassed(needed, total), true);
    assert.equal(DuelPatentService.isExamPassed(needed - 1, total), false);
  });

  it('blocks A1 travel pack for resident patent', () => {
    assert.equal(usesA1TravelPack('tourist'), true);
    assert.equal(usesA1TravelPack('resident'), false);
  });
});
