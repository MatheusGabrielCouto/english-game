import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useCityMapStore } from '@/features/city/store/city-map-store'
import { getDaysLeftInSeason } from '@/features/metagame/constants/metagame-catalog'
import { useMetagameStore } from '@/features/metagame/store/metagame-store'
import type { ActiveCityEventViewModel } from '@/types/city-event'

import {
  computeSeasonTierProgress,
  formatDaysRemainingLabel,
  formatSeasonKeyLabel,
} from '../utils/home-events'

export type HomeSeasonSnapshot = {
  seasonKey: string
  seasonLabel: string
  tier: number
  seasonPoints: number
  daysLeft: number
  daysLeftLabel: string
  claimableTiers: number
  tierProgressPercent: number
  nextRewardLabel: string | null
}

export type HomeEventsSnapshot = {
  cityEvent: ActiveCityEventViewModel | null
  season: HomeSeasonSnapshot | null
  hasRealContent: boolean
  isLoading: boolean
}

export const useHomeEvents = (): HomeEventsSnapshot => {
  const cityEvent = useCityMapStore((s) => s.activeCityEvent)
  const {
    metagameState,
    isMetagameLoading,
    currentSeasonTier,
    claimableSeasonTiers,
    nextSeasonTier,
  } = useMetagameStore(
    useShallow((s) => ({
      metagameState: s.state,
      isMetagameLoading: s.isLoading,
      currentSeasonTier: s.currentSeasonTier,
      claimableSeasonTiers: s.claimableSeasonTiers,
      nextSeasonTier: s.nextSeasonTier,
    })),
  )

  const daysLeft = getDaysLeftInSeason()

  const season = useMemo((): HomeSeasonSnapshot | null => {
    if (!metagameState) return null

    return {
      seasonKey: metagameState.seasonKey,
      seasonLabel: formatSeasonKeyLabel(metagameState.seasonKey),
      tier: currentSeasonTier,
      seasonPoints: metagameState.seasonPoints,
      daysLeft,
      daysLeftLabel: formatDaysRemainingLabel(daysLeft),
      claimableTiers: claimableSeasonTiers,
      tierProgressPercent: computeSeasonTierProgress(
        metagameState.seasonPoints,
        nextSeasonTier?.pointsRequired,
      ),
      nextRewardLabel: nextSeasonTier?.rewardLabel ?? null,
    }
  }, [
    claimableSeasonTiers,
    currentSeasonTier,
    daysLeft,
    metagameState,
    nextSeasonTier?.pointsRequired,
    nextSeasonTier?.rewardLabel,
  ])

  const hasRealContent = Boolean(cityEvent || season)

  return {
    cityEvent,
    season,
    hasRealContent,
    isLoading: isMetagameLoading && !hasRealContent,
  }
}
