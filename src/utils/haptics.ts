import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

import type { HapticKind } from '@/constants/haptic-vocabulary'

const isAvailable = Platform.OS !== 'web'

const runImpact = (style: Haptics.ImpactFeedbackStyle) => {
  if (!isAvailable) return
  void Haptics.impactAsync(style)
}

const runNotification = (type: Haptics.NotificationFeedbackType) => {
  if (!isAvailable) return
  void Haptics.notificationAsync(type)
}

const runSelection = () => {
  if (!isAvailable) return
  void Haptics.selectionAsync()
}

/** Fires a semantic haptic. Prefer this over raw expo-haptics in features. */
export const playHaptic = (kind: HapticKind) => {
  switch (kind) {
    case 'tap':
    case 'tab':
      runSelection()
      break
    case 'press':
      runImpact(Haptics.ImpactFeedbackStyle.Light)
      break
    case 'confirm':
      runImpact(Haptics.ImpactFeedbackStyle.Medium)
      break
    case 'impact':
      runImpact(Haptics.ImpactFeedbackStyle.Heavy)
      break
    case 'success':
      runNotification(Haptics.NotificationFeedbackType.Success)
      break
    case 'warning':
      runNotification(Haptics.NotificationFeedbackType.Warning)
      break
    case 'error':
      runNotification(Haptics.NotificationFeedbackType.Error)
      break
    default: {
      const exhaustive: never = kind
      return exhaustive
    }
  }
}

/**
 * Haptic API — semantic names first; legacy aliases kept for gradual migration.
 * @see docs/DESIGN_SYSTEM.md#haptics
 */
export const haptics = {
  tap: () => playHaptic('tap'),
  press: () => playHaptic('press'),
  confirm: () => playHaptic('confirm'),
  impact: () => playHaptic('impact'),
  tab: () => playHaptic('tab'),
  success: () => playHaptic('success'),
  warning: () => playHaptic('warning'),
  error: () => playHaptic('error'),

  /** @deprecated Use `press` */
  light: () => playHaptic('press'),
  /** @deprecated Use `confirm` */
  medium: () => playHaptic('confirm'),
  /** @deprecated Use `impact` */
  heavy: () => playHaptic('impact'),
  /** @deprecated Use `tap` */
  selection: () => playHaptic('tap'),
}
