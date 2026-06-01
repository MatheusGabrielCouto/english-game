import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Mission } from '@/types/mission';

import {
  findIncompleteMissionByTemplateKey,
  shouldAutoCompleteDuelWinMission,
  shouldAutoCompleteFlashMission,
  shouldAutoCompleteFlawlessMission,
} from '../learning-mission-utils';

describe('learning-mission-utils', () => {
  const missions: Mission[] = [
    {
      id: '1',
      title: 'Duel',
      description: '',
      xpReward: 10,
      coinReward: 5,
      completed: false,
      templateKey: 'learning_daily_duel_win',
    },
    {
      id: '2',
      title: 'Done',
      description: '',
      xpReward: 10,
      coinReward: 5,
      completed: true,
      templateKey: 'learning_daily_duel_win',
    },
  ];

  it('finds incomplete mission by template key', () => {
    const found = findIncompleteMissionByTemplateKey(missions, 'learning_daily_duel_win');
    assert.equal(found?.id, '1');
  });

  it('auto-completes flash mission at threshold', () => {
    assert.equal(shouldAutoCompleteFlashMission(4), false);
    assert.equal(shouldAutoCompleteFlashMission(5), true);
  });

  it('skips patent exam for duel win mission', () => {
    assert.equal(shouldAutoCompleteDuelWinMission(true, 'patent_exam'), false);
    assert.equal(shouldAutoCompleteDuelWinMission(true, 'dojo'), true);
  });

  it('requires flawless win for flawless mission', () => {
    assert.equal(shouldAutoCompleteFlawlessMission(true, false), false);
    assert.equal(shouldAutoCompleteFlawlessMission(true, true), true);
  });
});
