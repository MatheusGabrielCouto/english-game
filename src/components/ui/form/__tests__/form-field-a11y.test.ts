import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getFormFieldInputA11y, resolveFormFieldErrorId } from '../form-field-a11y'

describe('form-field-a11y', () => {
  it('links invalid inputs to inline error ids', () => {
    const props = getFormFieldInputA11y({
      label: 'Nome',
      error: 'Muito curto',
      errorNativeId: 'player-name-error',
    })

    assert.equal(props.accessibilityDescribedBy, 'player-name-error')
  })

  it('omits describedBy when field is valid', () => {
    const props = getFormFieldInputA11y({
      label: 'Nome',
      error: null,
      errorNativeId: 'player-name-error',
    })

    assert.equal(props.accessibilityDescribedBy, undefined)
  })

  it('builds stable error element ids', () => {
    assert.equal(resolveFormFieldErrorId('journal-title'), 'journal-title-error')
  })
})
