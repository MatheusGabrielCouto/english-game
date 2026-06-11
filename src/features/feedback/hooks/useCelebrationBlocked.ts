import { useAchievementsStore } from '@/features/achievements/store/achievements-store'
import { useCityStore } from '@/features/city/store/city-store'
import { useTitlesStore } from '@/features/titles/store/titles-store'

import { useFeedbackStore } from '../store/feedback-store'

/** True while a blocking celebration modal should take priority over reward bursts. */
export const useCelebrationBlocked = (): boolean => {
  const activeLevelUp = useFeedbackStore((state) => state.activeLevelUp)
  const petEvolution = useFeedbackStore((state) => state.petEvolution)
  const prestigeCelebration = useFeedbackStore((state) => state.prestigeCelebration)
  const achievementCelebration = useAchievementsStore((state) => state.celebration)
  const titleCelebration = useTitlesStore((state) => state.celebration)
  const cityCelebration = useCityStore((state) => state.celebration)

  return Boolean(
    activeLevelUp ||
      petEvolution ||
      prestigeCelebration ||
      achievementCelebration ||
      titleCelebration ||
      cityCelebration,
  )
}
