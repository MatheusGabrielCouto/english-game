import { CityEventService } from '@/features/city/services/city-event-service'
import { CityMapService } from '@/features/city/services/city-map-service'
import { CityService } from '@/features/city/services/city-service'
import { useCityMapStore } from '@/features/city/store/city-map-store'
import { useCityStore } from '@/features/city/store/city-store'
import { LearningGpsService } from '@/features/learning-gps/services/learning-gps-service'
import { useLearningGpsStore } from '@/features/learning-gps/store/learning-gps-store'
import { MotivationDailyPickService } from '@/features/motivation-spark/services/motivation-daily-pick-service'
import { PetService } from '@/features/pet/services/pet-service'
import { useMissionsStore } from '@/features/quests/store/missions-store'

import { getMotivationSettings } from '@/storage/repositories/motivation-settings-repository'

let homeScreenDataReady = false

export const isHomeScreenStoresReady = (): boolean => homeScreenDataReady

export const markHomeScreenStoresReady = (): void => {
  homeScreenDataReady = true
}

export const resetHomeScreenStoresReadyForTests = (): void => {
  homeScreenDataReady = false
}

/** Ensures every Home card dependency is in memory before the first paint. */
export const hydrateHomeScreenStores = async (): Promise<void> => {
  if (!PetService.getCachedPet()) {
    await PetService.initialize()
  }

  await LearningGpsService.hydrate()

  if (useCityStore.getState().buildings.length === 0) {
    await CityService.refresh()
  }

  if (useCityMapStore.getState().pois.length === 0) {
    await CityMapService.refresh()
  }

  await CityEventService.syncActiveEvent()

  await Promise.all([
    MotivationSparkServiceWarmup(),
    MotivationDailyPickService.getDailySpark(),
  ])

  useMissionsStore.setState({ isSyncing: false })
  useLearningGpsStore.setState({ isSyncing: false })

  markHomeScreenStoresReady()
}

const MotivationSparkServiceWarmup = async (): Promise<void> => {
  try {
    await getMotivationSettings()
  } catch {
    // Motivation is optional on Home — never block startup.
  }
}
