/** Form validation feedback — English Quest. @see docs/DESIGN_SYSTEM.md */
export const FORM_FIELD_SHAKE = {
  offsetPx: 8,
  stepMs: 42,
} as const

export const formInputBorderClass = (hasError: boolean): string =>
  hasError ? 'border-danger' : 'border-border'
