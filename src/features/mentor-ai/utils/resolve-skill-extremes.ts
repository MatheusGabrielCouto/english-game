import { LearningSkillKey, type LearningSkillKeyValue, type SkillLevelRecord } from '@/types/learning-gps'

export const resolveSkillExtremes = (
  skills: SkillLevelRecord[],
): { weakest: LearningSkillKeyValue; strongest: LearningSkillKeyValue } => {
  if (skills.length === 0) {
    return {
      weakest: LearningSkillKey.SPEAKING,
      strongest: LearningSkillKey.VOCABULARY,
    }
  }

  const sorted = [...skills].sort((a, b) => a.level - b.level)
  return {
    weakest: sorted[0].skillKey,
    strongest: sorted[sorted.length - 1].skillKey,
  }
}
