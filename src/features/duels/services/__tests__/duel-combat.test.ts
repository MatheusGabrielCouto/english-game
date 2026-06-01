import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DUEL_COMBAT_CONFIG } from '../../constants/duel-combat-config';
import { DuelCombatService } from '../duel-combat-service';
import { resolveQuestionCount } from '../../utils/duel-session-utils';

describe('DuelCombatService', () => {
  it('applies combo multiplier on third consecutive hit', () => {
    const state = DuelCombatService.createInitialState(100, 80);
    const first = DuelCombatService.applyCorrectHit(state, 12, 0.6);
    const second = DuelCombatService.applyCorrectHit(first.state, 12, 0.6);
    const third = DuelCombatService.applyCorrectHit(second.state, 12, 0.6);

    assert.ok(first.damageDealt >= 12);
    assert.ok(third.damageDealt > first.damageDealt);
    assert.ok(DuelCombatService.isComboCritical(third.state.comboStreak));
  });

  it('resets combo and damages player on wrong answer', () => {
    const state = { playerHp: 100, enemyHp: 80, comboStreak: 2 };
    const wrong = DuelCombatService.applyWrongAnswer(state, 20);

    assert.equal(wrong.state.playerHp, 80);
    assert.equal(wrong.state.comboStreak, 0);
    assert.equal(wrong.damageTaken, 20);
  });

  it('detects victory and defeat', () => {
    assert.equal(DuelCombatService.isVictory({ playerHp: 50, enemyHp: 0, comboStreak: 1 }), true);
    assert.equal(DuelCombatService.isDefeat({ playerHp: 0, enemyHp: 10, comboStreak: 0 }), true);
  });
});

describe('resolveQuestionCount', () => {
  it('returns value within configured bounds', () => {
    const count = resolveQuestionCount('session_seed_123');
    assert.ok(count >= DUEL_COMBAT_CONFIG.questionCountMin);
    assert.ok(count <= DUEL_COMBAT_CONFIG.questionCountMax);
  });

  it('ensures enough questions to defeat enemy at base damage', () => {
    const count = resolveQuestionCount('boss_session', {
      enemyHp: 160,
      playerDamage: 14,
    });
    assert.ok(count >= 12);
  });
});
