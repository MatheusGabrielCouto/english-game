import { FarmActivityType, type FarmActivityTypeValue } from '@/types/farm'
import { LearningSkillKey, type LearningSkillKeyValue } from '@/types/learning-gps'

export type FarmGpsCreditTarget = {
  skillKey: LearningSkillKeyValue
  preferReviewBlock: boolean
}

const FARM_ACTIVITY_GPS_TARGETS: Record<FarmActivityTypeValue, FarmGpsCreditTarget> = {
  [FarmActivityType.VOCABULARY]: {
    skillKey: LearningSkillKey.VOCABULARY,
    preferReviewBlock: false,
  },
  [FarmActivityType.READING]: {
    skillKey: LearningSkillKey.READING,
    preferReviewBlock: false,
  },
  [FarmActivityType.LISTENING]: {
    skillKey: LearningSkillKey.LISTENING,
    preferReviewBlock: false,
  },
  [FarmActivityType.SPEAKING]: {
    skillKey: LearningSkillKey.SPEAKING,
    preferReviewBlock: false,
  },
  [FarmActivityType.PROGRAMMING]: {
    skillKey: LearningSkillKey.READING,
    preferReviewBlock: false,
  },
  [FarmActivityType.EXERCISE]: {
    skillKey: LearningSkillKey.GRAMMAR,
    preferReviewBlock: false,
  },
  [FarmActivityType.REVIEW]: {
    skillKey: LearningSkillKey.VOCABULARY,
    preferReviewBlock: true,
  },
}

/** Converts farm `amount` (words, minutes, exercises…) into GPS study minutes. */
export const farmAmountToGpsMinutes = (
  activityType: FarmActivityTypeValue,
  amount: number,
): number => {
  const safeAmount = Math.max(0, amount)
  if (safeAmount <= 0) return 0

  switch (activityType) {
    case FarmActivityType.VOCABULARY:
      return Math.max(1, Math.round(safeAmount / 2))
    case FarmActivityType.EXERCISE:
      return Math.max(1, Math.round(safeAmount * 2))
    case FarmActivityType.REVIEW:
      return Math.max(1, Math.round(safeAmount))
    default:
      return Math.max(1, Math.round(safeAmount))
  }
}

export const resolveFarmGpsTarget = (
  activityType: string,
): FarmGpsCreditTarget | null => {
  if (!(activityType in FARM_ACTIVITY_GPS_TARGETS)) return null
  return FARM_ACTIVITY_GPS_TARGETS[activityType as FarmActivityTypeValue]
}
