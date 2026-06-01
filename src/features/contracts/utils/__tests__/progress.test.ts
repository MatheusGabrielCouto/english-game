import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ContractStatus } from '@/types/contract';

import { CONTRACT_DEFINITIONS } from '../../constants/default-contracts';
import {
    buildAnalyticsSummary,
    buildContractViewModel,
    getAvailableContractKeys,
    getStatusLabel,
    sumRewardCoins,
} from '../progress';

describe('contract progress utils', () => {
  it('builds contract view model with remaining days', () => {
    const definition = CONTRACT_DEFINITIONS[1];
    const viewModel = buildContractViewModel(
      {
        id: 1,
        contractKey: definition.key,
        status: ContractStatus.ACTIVE,
        targetDays: definition.targetDays,
        progressDays: 5,
        stakeAmount: definition.stakeAmount,
        startedAt: '2026-01-01T00:00:00.000Z',
        endedAt: null,
        lastProgressAt: '2026-01-05',
      },
      definition,
    );

    assert.equal(viewModel.daysRemaining, 2);
    assert.equal(viewModel.name, 'Weekly Focus');
  });

  it('returns empty available list when active contract exists', () => {
    const keys = getAvailableContractKeys({
      id: 1,
      contractKey: 'weekly_focus',
      status: ContractStatus.ACTIVE,
      targetDays: 7,
      progressDays: 1,
      stakeAmount: 100,
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: null,
      lastProgressAt: '2026-01-01',
    });

    assert.deepEqual(keys, []);
  });

  it('calculates analytics success rate', () => {
    const summary = buildAnalyticsSummary({
      totalAccepted: 4,
      totalCompleted: 3,
      totalFailed: 1,
      totalCoinsStaked: 825,
      totalCoinsWon: 3075,
      totalCoinsLost: 100,
      totalShieldsGranted: 6,
      totalLootBoxesGranted: 3,
      largestContractCompletedKey: 'weekly_focus',
      lastContractAt: '2026-01-10T00:00:00.000Z',
    });

    assert.equal(summary.successRate, 75);
  });

  it('sums coin rewards from contract definition', () => {
    const coins = sumRewardCoins(CONTRACT_DEFINITIONS[0].rewards);
    assert.equal(coins, 75);
  });

  it('maps status labels', () => {
    assert.equal(getStatusLabel(ContractStatus.COMPLETED), 'Concluído');
    assert.equal(getStatusLabel(ContractStatus.FAILED), 'Falhou');
  });
});
