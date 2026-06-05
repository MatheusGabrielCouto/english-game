/** WCAG / Apple HIG minimum touch target (44×44 pt). */
export const MIN_TOUCH_TARGET_PT = 44

/** Square minimum target for icon buttons and tiles. */
export const TOUCH_TARGET_MIN_CLASS = 'min-h-11 min-w-11'

/** Horizontal chips / pills — height floor; width grows with label. */
export const TOUCH_TARGET_CHIP_CLASS = 'min-h-11 items-center justify-center'

/** Segmented screen tab list container (Play, Quests, Shop, …). */
export const SCREEN_TAB_LIST_CLASS = 'flex-row rounded-2xl border border-border bg-surface p-1'

/** Pressable inside segmented tab list. */
export const SCREEN_TAB_PRESSABLE_CLASS =
  'flex-1 min-h-11 flex-row items-center justify-center rounded-xl'

export const SCREEN_TAB_PRESSABLE_ACTIVE_CLASS = 'bg-primary'

export const SCREEN_TAB_LABEL_ACTIVE_CLASS = 'text-primary-foreground'

export const SCREEN_TAB_LABEL_INACTIVE_CLASS = 'text-foreground-secondary'

/** hitSlop for ~20pt icon buttons → 44pt effective target. */
export const ICON_TOUCH_HIT_SLOP = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
} as const
