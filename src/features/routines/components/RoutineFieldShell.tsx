import { type ReactNode } from 'react'

import { formInputBorderClass } from '@/constants/form-validation-ui'
import { FormFieldShell } from '@/components/ui/form/FormFieldShell'

type RoutineFieldShellProps = {
  label: string
  hint?: string
  error?: string | null
  fieldId?: string
  footer?: string | null
  footerTone?: 'muted' | 'success' | 'danger'
  children: ReactNode
  showClear?: boolean
  onClear?: () => void
  className?: string
}

/** @deprecated Use `formInputBorderClass` from `@/constants/form-validation-ui` */
export const routineInputBorderClass = formInputBorderClass

export const RoutineFieldShell = (props: RoutineFieldShellProps) => <FormFieldShell {...props} />
