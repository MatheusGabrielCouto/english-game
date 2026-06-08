import { LearningSkillKey, type LearningSkillKeyValue, type LearningSkillWeakness, type SkillLevelRecord } from '@/types/learning-gps'

export const WEAKNESS_THRESHOLD_RATIO = 0.7
const MEDIUM_THRESHOLD_RATIO = 0.85

const priorityRank = { high: 0, medium: 1, low: 2 } as const

export const detectSkillWeaknesses = (skills: SkillLevelRecord[]): LearningSkillWeakness[] => {
  const hasProgress = skills.some((skill) => skill.level > 0)
  if (!hasProgress) return []

  return skills
    .map((skill) => {
      const others = skills.filter((entry) => entry.skillKey !== skill.skillKey)
      const averageOthers =
        others.reduce((sum, entry) => sum + entry.level, 0) / Math.max(others.length, 1)
      const ratio = averageOthers > 0 ? skill.level / averageOthers : 1
      const gapPercent = Math.max(0, Math.round((1 - ratio) * 100))

      let priority: LearningSkillWeakness['priority'] = 'low'
      if (averageOthers > 0 && skill.level < averageOthers * WEAKNESS_THRESHOLD_RATIO) {
        priority = 'high'
      } else if (skill.level < averageOthers * MEDIUM_THRESHOLD_RATIO) {
        priority = 'medium'
      }

      return {
        skillKey: skill.skillKey,
        level: skill.level,
        averageOthers: Math.round(averageOthers),
        gapPercent,
        priority,
      }
    })
    .filter((weakness) => weakness.priority !== 'low')
    .sort((a, b) => {
      const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.gapPercent - a.gapPercent
    })
}

export const getPrioritySkillKeys = (weaknesses: LearningSkillWeakness[]): LearningSkillKeyValue[] =>
  weaknesses.filter((weakness) => weakness.priority === 'high').map((weakness) => weakness.skillKey)

export const getSkillLabel = (skillKey: LearningSkillKeyValue): string => {
  const labels: Record<LearningSkillKeyValue, string> = {
    [LearningSkillKey.VOCABULARY]: 'Vocabulário',
    [LearningSkillKey.READING]: 'Leitura',
    [LearningSkillKey.LISTENING]: 'Escuta',
    [LearningSkillKey.SPEAKING]: 'Conversação',
    [LearningSkillKey.WRITING]: 'Escrita',
    [LearningSkillKey.GRAMMAR]: 'Gramática',
  }
  return labels[skillKey]
}
