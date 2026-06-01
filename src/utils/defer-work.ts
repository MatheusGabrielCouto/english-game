import { InteractionManager } from 'react-native'

import { AppLogService } from '@/services/app-log-service'

/** Runs after animations / gestures complete — keeps taps feeling instant. */
export const runAfterInteractions = (work: () => void): void => {
  InteractionManager.runAfterInteractions(() => {
    work()
  })
}

/** Fire-and-forget async work with error logging (never blocks the caller). */
export const runInBackground = (label: string, work: () => Promise<void>): void => {
  void work().catch((error) => {
    AppLogService.warn(`background.${label}_failed`, `Background task failed: ${label}`, {
      message: error instanceof Error ? error.message : String(error),
    })
  })
}
