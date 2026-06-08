import { RoutineCategory, type RoutineCategoryValue } from '@/types/routine'
import { LearningSkillKey, type LearningSkillKeyValue } from '@/types/learning-gps'

const ROUTINE_CATEGORY_SKILL_MAP: Record<RoutineCategoryValue, LearningSkillKeyValue> = {
  [RoutineCategory.ENGLISH_COURSE]: LearningSkillKey.VOCABULARY,
  [RoutineCategory.VOCABULARY]: LearningSkillKey.VOCABULARY,
  [RoutineCategory.READING]: LearningSkillKey.READING,
  [RoutineCategory.LISTENING]: LearningSkillKey.LISTENING,
  [RoutineCategory.SPEAKING]: LearningSkillKey.SPEAKING,
  [RoutineCategory.WRITING]: LearningSkillKey.WRITING,
  [RoutineCategory.GRAMMAR]: LearningSkillKey.GRAMMAR,
  [RoutineCategory.CAREER]: LearningSkillKey.SPEAKING,
  [RoutineCategory.PROGRAMMING_ENGLISH]: LearningSkillKey.READING,
  [RoutineCategory.PERSONAL]: LearningSkillKey.VOCABULARY,
}

export const DEFAULT_ROUTINE_GPS_MINUTES = 15

export const resolveRoutineSkillKey = (category: RoutineCategoryValue): LearningSkillKeyValue =>
  ROUTINE_CATEGORY_SKILL_MAP[category] ?? LearningSkillKey.VOCABULARY

export const routineDurationToGpsMinutes = (expectedDurationMin: number | null): number => {
  if (expectedDurationMin != null && expectedDurationMin > 0) {
    return Math.min(expectedDurationMin, 60)
  }
  return DEFAULT_ROUTINE_GPS_MINUTES
}
