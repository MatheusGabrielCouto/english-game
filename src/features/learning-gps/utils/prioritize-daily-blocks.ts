import type { DailyStudyBlock, LearningSkillKeyValue } from '@/types/learning-gps'

export const prioritizeDailyBlocks = (
  blocks: DailyStudyBlock[],
  prioritySkillKeys: LearningSkillKeyValue[],
): DailyStudyBlock[] => {
  if (prioritySkillKeys.length === 0) return blocks

  return [...blocks].sort((left, right) => {
    const leftIndex = prioritySkillKeys.indexOf(left.skillKey)
    const rightIndex = prioritySkillKeys.indexOf(right.skillKey)
    const leftRank = leftIndex >= 0 ? leftIndex : Number.MAX_SAFE_INTEGER
    const rightRank = rightIndex >= 0 ? rightIndex : Number.MAX_SAFE_INTEGER
    return leftRank - rightRank
  })
}
