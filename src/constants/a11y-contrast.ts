import { theme } from './theme'

/** Card / panel surfaces audited for text contrast (P-14). */
export const CARD_A11Y_SURFACES = {
  surface: theme.colors.surface,
  surfaceElevated: theme.colors.surfaceElevated,
  background: theme.colors.background,
} as const

/** Semantic text tokens on cards. */
export const CARD_A11Y_TEXT = {
  foreground: theme.colors.foreground,
  foregroundSecondary: theme.colors.foregroundSecondary,
  muted: theme.colors.muted,
  primary: theme.colors.primary,
  success: theme.colors.success,
} as const

/** Previous muted — fails WCAG AA on `surface` at 12px. */
export const LEGACY_MUTED_COLOR = '#71717a'

/** Minimum font size (px) for `text-muted` metadata on cards. */
export const CARD_MUTED_MIN_FONT_PX = 12

/** NativeWind classes for card metadata (12px+, WCAG-friendly). */
export const CARD_METADATA_TEXT_CLASS = 'text-xs font-bold uppercase tracking-wide'
export const CARD_MUTED_CAPTION_CLASS = 'text-xs text-muted'
