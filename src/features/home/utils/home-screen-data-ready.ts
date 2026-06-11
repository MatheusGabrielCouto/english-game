export type HomeScreenDataSnapshot = {
  applicationHydrated: boolean
  playerHydrated: boolean
  missionsHydrated: boolean
  missionsSyncing: boolean
  routinesLoading: boolean
  weeklyLoading: boolean
  learningGpsHydrated: boolean
  learningGpsSyncing: boolean
  cityLoading: boolean
  cityBuildingsCount: number
  cityMapLoading: boolean
  contractsLoading: boolean
  epicLoading: boolean
  metagameLoading: boolean
  petReady: boolean
}

export const isHomeScreenDataReady = (snapshot: HomeScreenDataSnapshot): boolean => {
  if (!snapshot.applicationHydrated) return false
  if (!snapshot.playerHydrated) return false
  if (!snapshot.missionsHydrated || snapshot.missionsSyncing) return false
  if (snapshot.routinesLoading || snapshot.weeklyLoading) return false
  if (!snapshot.learningGpsHydrated || snapshot.learningGpsSyncing) return false
  if (!snapshot.petReady) return false
  if (snapshot.cityLoading || snapshot.cityBuildingsCount === 0) return false
  if (snapshot.cityMapLoading) return false
  if (snapshot.contractsLoading || snapshot.epicLoading || snapshot.metagameLoading) return false

  return true
}
