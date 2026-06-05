import { type ReactNode } from 'react'

import { FormFieldShell } from '@/components/ui/form/FormFieldShell'

type VaultFieldProps = {
  label: string
  hint?: string
  error?: string | null
  fieldId?: string
  children: ReactNode
}

export const VaultField = ({ label, hint, error, fieldId, children }: VaultFieldProps) => (
  <FormFieldShell label={label} hint={hint} error={error} fieldId={fieldId}>
    {children}
  </FormFieldShell>
)
