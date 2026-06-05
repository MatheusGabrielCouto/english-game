/**
 * Semantic haptic vocabulary — English Quest.
 * @see docs/DESIGN_SYSTEM.md#haptics
 */
export type HapticKind =
  | 'tap'
  | 'press'
  | 'confirm'
  | 'impact'
  | 'success'
  | 'warning'
  | 'error'
  | 'tab'

export const HAPTIC_KIND_LABELS: Record<HapticKind, string> = {
  tap: 'Toque leve em cards, pills e linhas de lista',
  press: 'Botões secundários, toggles e campos de formulário',
  confirm: 'CTA primário e ações importantes',
  impact: 'Momentos dramáticos (prestígio, loot, evolução)',
  success: 'Conclusões, recompensas e desbloqueios',
  warning: 'Falhas suaves, punições e ações destrutivas',
  error: 'Erros de validação e falhas de rede',
  tab: 'Troca de aba na tab bar',
}

/** Default haptic when pressing a `Button` variant. */
export const BUTTON_HAPTIC_BY_VARIANT = {
  primary: 'confirm',
  secondary: 'press',
  ghost: 'tap',
  danger: 'warning',
} as const satisfies Record<string, HapticKind>

/** Default haptic for `PressableScale` (game cards, quick actions). */
export const PRESSABLE_SCALE_DEFAULT_HAPTIC: HapticKind = 'tap'
