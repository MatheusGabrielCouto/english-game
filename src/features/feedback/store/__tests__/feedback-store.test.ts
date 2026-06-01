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
