import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { useFeedbackStore } from '../feedback-store'

describe('feedback store toast queue', () => {
  it('queues toasts when one is already active', () => {
    useFeedbackStore.setState({ activeToast: null, toastQueue: [] })

    useFeedbackStore.getState().showToast('Primeira', 'success')
    useFeedbackStore.getState().showToast('Segunda', 'info')

    const state = useFeedbackStore.getState()
    assert.equal(state.activeToast?.message, 'Primeira')
    assert.equal(state.toastQueue.length, 1)
    assert.equal(state.toastQueue[0]?.message, 'Segunda')
  })

  it('promotes next toast after dismiss', () => {
    useFeedbackStore.setState({
      activeToast: {
        id: '1',
        message: 'Primeira',
        variant: 'success',
        durationMs: 2800,
      },
      toastQueue: [
        {
          id: '2',
          message: 'Segunda',
          variant: 'info',
          durationMs: 2800,
        },
      ],
    })

    useFeedbackStore.getState().dismissToast()

    const state = useFeedbackStore.getState()
    assert.equal(state.activeToast?.message, 'Segunda')
    assert.equal(state.toastQueue.length, 0)
  })
})

describe('feedback store reward bursts', () => {
  it('shows one active burst at a time', () => {
    useFeedbackStore.setState({ activeRewardBurst: null, rewardBurstQueue: [] })

    useFeedbackStore.getState().addRewardBurst({
      source: 'routine',
      title: 'Ler 10 min',
      xp: 8,
      coins: 3,
    })
    useFeedbackStore.getState().addRewardBurst({
      source: 'vault',
      title: 'Revisão do Vault concluída!',
      xp: 5,
      coins: 0,
    })

    const state = useFeedbackStore.getState()
    assert.equal(state.activeRewardBurst?.source, 'routine')
    assert.equal(state.rewardBurstQueue.length, 1)
    assert.equal(state.rewardBurstQueue[0]?.source, 'vault')
  })

  it('promotes queued burst after completion', () => {
    useFeedbackStore.setState({
      activeRewardBurst: {
        id: 'active',
        source: 'routine',
        title: 'Ler 10 min',
        xp: 8,
        coins: 3,
      },
      rewardBurstQueue: [
        {
          id: 'queued',
          source: 'vault',
          title: 'Revisão do Vault concluída!',
          xp: 5,
          coins: 0,
        },
      ],
    })

    useFeedbackStore.getState().completeRewardBurst('active')

    const state = useFeedbackStore.getState()
    assert.equal(state.activeRewardBurst?.id, 'queued')
    assert.equal(state.rewardBurstQueue.length, 0)
  })

  it('merges queued bursts while one is active', () => {
    useFeedbackStore.setState({ activeRewardBurst: null, rewardBurstQueue: [] })

    useFeedbackStore.getState().addRewardBurst({
      source: 'routine',
      title: 'Rotina A',
      xp: 10,
      coins: 2,
    })
    useFeedbackStore.getState().addRewardBurst({
      source: 'focus',
      title: 'Foco',
      xp: 5,
      coins: 1,
    })
    useFeedbackStore.getState().addRewardBurst({
      source: 'vault',
      title: 'Vault',
      xp: 3,
      coins: 0,
      studyPoints: 2,
    })

    const state = useFeedbackStore.getState()
    assert.equal(state.activeRewardBurst?.title, 'Rotina A')
    assert.equal(state.rewardBurstQueue.length, 1)
    assert.equal(state.rewardBurstQueue[0]?.xp, 8)
    assert.equal(state.rewardBurstQueue[0]?.coins, 1)
    assert.equal(state.rewardBurstQueue[0]?.studyPoints, 2)
    assert.equal(state.rewardBurstQueue[0]?.batchCount, 2)
  })
})
