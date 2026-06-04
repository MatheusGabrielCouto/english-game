import { COLLECTION_FORM_LIMITS } from '../constants/collection-form-limits'

export type FieldValidation = { valid: boolean; error: string | null }

export const validateCollectionName = (value: string): FieldValidation => {
  const trimmed = value.trim()
  if (trimmed.length < COLLECTION_FORM_LIMITS.nameMin) {
    return { valid: false, error: `Nome precisa de pelo menos ${COLLECTION_FORM_LIMITS.nameMin} caracteres` }
  }
  if (trimmed.length > COLLECTION_FORM_LIMITS.nameMax) {
    return { valid: false, error: `Máximo ${COLLECTION_FORM_LIMITS.nameMax} caracteres` }
  }
  return { valid: true, error: null }
}

export const validateCollectionDescription = (value: string): FieldValidation => {
  if (value.trim().length > COLLECTION_FORM_LIMITS.descriptionMax) {
    return { valid: false, error: `Máximo ${COLLECTION_FORM_LIMITS.descriptionMax} caracteres` }
  }
  return { valid: true, error: null }
}

export const validateCollectionForm = (input: {
  name: string
  description: string
}): FieldValidation => {
  const nameCheck = validateCollectionName(input.name)
  if (!nameCheck.valid) return nameCheck
  return validateCollectionDescription(input.description)
}
