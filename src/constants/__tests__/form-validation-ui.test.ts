import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { FORM_FIELD_SHAKE, formInputBorderClass } from '../form-validation-ui'

describe('form-validation-ui', () => {
  it('toggles danger border on error', () => {
    assert.equal(formInputBorderClass(true), 'border-danger')
    assert.equal(formInputBorderClass(false), 'border-border')
  })

  it('defines shake motion tuning', () => {
    assert.ok(FORM_FIELD_SHAKE.offsetPx > 0)
    assert.ok(FORM_FIELD_SHAKE.stepMs > 0)
  })
})
