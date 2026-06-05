import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

import type { ChangelogEntry } from '../constants/changelog-catalog'
import { CHANGELOG_STORAGE_KEY } from '../constants/changelog-ui'
import { resolveAppVersion } from '../utils/app-version'
import {
  resolveChangelogEntryToShow,
  shouldSeedChangelogBaseline,
} from '../utils/changelog-visibility'

type UseChangelogCardResult = {
  entry: ChangelogEntry | null
  shouldShow: boolean
  isReady: boolean
  dismiss: () => void
}

export const useChangelogCard = (): UseChangelogCardResult => {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const currentVersion = resolveAppVersion()
      const lastSeenVersion = await AsyncStorage.getItem(CHANGELOG_STORAGE_KEY)

      if (shouldSeedChangelogBaseline(lastSeenVersion)) {
        await AsyncStorage.setItem(CHANGELOG_STORAGE_KEY, currentVersion)
        if (!cancelled) {
          setEntry(null)
          setIsReady(true)
        }
        return
      }

      const nextEntry = resolveChangelogEntryToShow({
        currentVersion,
        lastSeenVersion,
      })

      if (!cancelled) {
        setEntry(nextEntry)
        setIsReady(true)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const dismiss = useCallback(() => {
    const currentVersion = resolveAppVersion()
    setEntry(null)
    void AsyncStorage.setItem(CHANGELOG_STORAGE_KEY, currentVersion)
  }, [])

  return {
    entry,
    shouldShow: isReady && entry !== null,
    isReady,
    dismiss,
  }
}
