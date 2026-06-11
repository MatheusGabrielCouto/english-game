import { useShallow } from 'zustand/react/shallow'

import { useAppStore } from '@/features/app/store/app-store'
import { useCityMapStore } from '@/features/city/store/city-map-store'
import { useCityStore } from '@/features/city/store/city-store'
import { useContractsStore } from '@/features/contracts/store/contracts-store'
import { useEpicQuestsStore } from '@/features/epic-quests/store/epic-quests-store'
import { useLearningGpsStore } from '@/features/learning-gps/store/learning-gps-store'
import { useMetagameStore } from '@/features/metagame/store/metagame-store'
import { PetService } from '@/features/pet/services/pet-service'
import { usePlayerStore } from '@/features/player/store/player-store'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { useRoutinesStore } from '@/features/routines/store/routines-store'
import { useTutorialStore } from '@/features/tutorial/store/tutorial-store'
import { useWeeklyMissionsStore } from '@/features/weekly-quests/store/weekly-missions-store'
import { useStartupHydrationStore } from '@/storage/startup-hydration-store'

import { isHomeScreenDataReady } from '../utils/home-screen-data-ready'

/** Home waits for startup hydration and, on first open, for the setup wizard to finish. */
export const useHomeScreenReady = (): boolean => {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded)
  const wizardCompleted = useTutorialStore((s) => s.wizardCompleted)

  const playerHydrated = usePlayerStore((s) => s._hasHydrated)
  const { missionsHydrated, missionsSyncing } = useMissionsStore(
    useShallow((s) => ({
      missionsHydrated: s._hasHydrated,
      missionsSyncing: s.isSyncing,
    })),
  )
  const routinesLoading = useRoutinesStore((s) => s.isLoading)
  const weeklyLoading = useWeeklyMissionsStore((s) => s.isLoading)
  const { learningGpsHydrated, learningGpsSyncing } = useLearningGpsStore(
    useShallow((s) => ({
      learningGpsHydrated: s.hasHydrated,
      learningGpsSyncing: s.isSyncing,
    })),
  )
  const { cityLoading, cityBuildingsCount } = useCityStore(
    useShallow((s) => ({
      cityLoading: s.isLoading,
      cityBuildingsCount: s.buildings.length,
    })),
  )
  const cityMapLoading = useCityMapStore((s) => s.isLoading)
  const contractsLoading = useContractsStore((s) => s.isLoading)
  const epicLoading = useEpicQuestsStore((s) => s.isLoading)
  const metagameLoading = useMetagameStore((s) => s.isLoading)
  const backgroundReady = useStartupHydrationStore((s) => s.backgroundReady)

  if (!hasOnboarded && !wizardCompleted) {
    return false
  }

  return isHomeScreenDataReady({
    applicationHydrated: backgroundReady,
    playerHydrated,
    missionsHydrated,
    missionsSyncing,
    routinesLoading,
    weeklyLoading,
    learningGpsHydrated,
    learningGpsSyncing,
    cityLoading,
    cityBuildingsCount,
    cityMapLoading,
    contractsLoading,
    epicLoading,
    metagameLoading,
    petReady: PetService.getCachedPet() !== null,
  })
}
