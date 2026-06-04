import AsyncStorage from '@react-native-async-storage/async-storage'

import { MENU_HUB_MAX_PINS } from '@/features/menu-hub/store/menu-hub-store'
import type { BackupPreferencesSnapshot } from '@/types/backup'

const MENU_HUB_PINNED_KEY = 'menu_hub_pinned_ids_v1'

export const snapshotBackupPreferences = async (): Promise<BackupPreferencesSnapshot> => {
  try {
    const raw = await AsyncStorage.getItem(MENU_HUB_PINNED_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    const menuHubPinnedIds = Array.isArray(parsed) ? parsed.slice(0, MENU_HUB_MAX_PINS) : []

    return { menuHubPinnedIds }
  } catch {
    return { menuHubPinnedIds: [] }
  }
}

export const restoreBackupPreferences = async (
  preferences: BackupPreferencesSnapshot,
): Promise<void> => {
  const menuHubPinnedIds = Array.isArray(preferences.menuHubPinnedIds)
    ? preferences.menuHubPinnedIds.slice(0, MENU_HUB_MAX_PINS)
    : []

  await AsyncStorage.setItem(MENU_HUB_PINNED_KEY, JSON.stringify(menuHubPinnedIds))
}
