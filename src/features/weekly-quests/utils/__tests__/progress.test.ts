import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { WeeklyMission } from '@/types/weekly-mission';

import { applyProgressDelta, capProgress, isMissionComplete } from '../progress';

const baseMission = (): WeeklyMission => ({
  id: 'test',
  title: 'Test',
  description: 'Test',
  missionType: 'XP_GAINED',
  targetValue: 100,
  currentValue: 0,
  xpReward: 10,
  coinReward: 5,
  completed: false,
  claimed: false,
  weekStartDate: '2026-05-26',
  weekEndDate: '2026-06-01',
  createdAt: '2026-05-26T00:00:00.000Z',
});

describe('capProgress', () => {
  it('clamps between 0 and target', () => {
    assert.equal(capProgress(-5, 10), 0);
    assert.equal(capProgress(15, 10), 10);
    assert.equal(capProgress(7, 10), 7);
  });
});

describe('isMissionComplete', () => {
  it('is true when currentValue meets target', () => {
    assert.equal(isMissionComplete({ currentValue: 10, targetValue: 10 }), true);
    assert.equal(isMissionComplete({ currentValue: 9, targetValue: 10 }), false);
  });
});

describe('applyProgressDelta', () => {
  it('increments progress and marks completed at target', () => {
    const mission = baseMission();
    const step = applyProgressDelta(mission, 50);
    assert.equal(step.currentValue, 50);
    assert.equal(step.completed, false);

    const done = applyProgressDelta(step, 60);
    assert.equal(done.currentValue, 100);
    assert.equal(done.completed, true);
  });

  it('ignores non-positive delta and completed missions', () => {
    const mission = { ...baseMission(), currentValue: 100, completed: true };
    const unchanged = applyProgressDelta(mission, 10);
    assert.equal(unchanged.currentValue, 100);
    assert.equal(applyProgressDelta(baseMission(), 0).currentValue, 0);
  });
});

/** Mirrors WeeklyMissionService.checkCompletion (pure logic, no DB). */
const checkCompletion = (mission: WeeklyMission): WeeklyMission => {
  if (mission.completed) return mission;
  if (!isMissionComplete(mission)) return mission;
  return { ...mission, completed: true };
};

describe('checkCompletion', () => {
  it('marks mission completed when target is met', () => {
    const mission = baseMission();
    assert.equal(checkCompletion(mission).completed, false);
    assert.equal(
      checkCompletion({ ...mission, currentValue: mission.targetValue }).completed,
      true,
    );
  });

  it('leaves already completed missions unchanged', () => {
    const mission = { ...baseMission(), currentValue: 100, completed: true };
    assert.equal(checkCompletion(mission).completed, true);
  });
});
