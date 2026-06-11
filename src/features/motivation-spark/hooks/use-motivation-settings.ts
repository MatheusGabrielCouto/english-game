import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

import { getMotivationSettings, saveMotivationSettings } from '@/storage/repositories/motivation-settings-repository'
import { runFocusRefreshIfNeeded } from '@/storage/startup-read-policy'
import type { MotivationSettingsRecord } from '@/types/motivation-spark'

import { MotivationNotificationService } from '../services/motivation-notification-service'

export const useMotivationSettings = () => {
  const [settings, setSettings] = useState<MotivationSettingsRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const record = await getMotivationSettings()
      setSettings(record)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      runFocusRefreshIfNeeded(settings !== null, refresh)
    }, [refresh, settings]),
  )

  const updateSettings = useCallback(
    async (patch: Partial<MotivationSettingsRecord>) => {
      if (!settings) return

      const next: MotivationSettingsRecord = {
        ...settings,
        ...patch,
        updatedAt: new Date().toISOString(),
      }

      await saveMotivationSettings(next)
      setSettings(next)
      await MotivationNotificationService.rescheduleAll()
    },
    [settings],
  )

  return {
    settings,
    isLoading,
    refresh,
    updateSettings,
  }
}
