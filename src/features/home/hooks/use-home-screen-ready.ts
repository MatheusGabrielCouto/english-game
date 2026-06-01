import { usePlayerStore } from '@/features/player/store/player-store'
import { useMissionsStore } from '@/features/quests/store/missions-store'

/** Core home data — optional preview cards load independently. */
export const useHomeScreenReady = (): boolean => {
  const playerHydrated = usePlayerStore((s) => s._hasHydrated)
  const missionsHydrated = useMissionsStore((s) => s._hasHydrated)

  return playerHydrated && missionsHydrated
}
