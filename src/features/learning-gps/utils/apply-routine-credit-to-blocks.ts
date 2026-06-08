import type { DailyStudyBlock } from '@/types/learning-gps'
import type { LearningSkillKeyValue } from '@/types/learning-gps'

import { applyMinutesToBlock } from './apply-farm-credit-to-blocks'

export const pickBlockForSkillCredit = (
  blocks: DailyStudyBlock[],
  skillKey: LearningSkillKeyValue,
): DailyStudyBlock | null => {
  const incomplete = blocks.filter((block) => !block.completed)

  return (
    incomplete.find((block) => block.skillKey === skillKey && block.label.toLowerCase() !== 'revisão') ??
    incomplete.find((block) => block.skillKey === skillKey) ??
    incomplete[0] ??
    null
  )
}

export const applyRoutineCreditToBlocks = (
  blocks: DailyStudyBlock[],
  skillKey: LearningSkillKeyValue,
  creditMinutes: number,
): { blocks: DailyStudyBlock[]; updatedBlock: DailyStudyBlock | null; newlyCompleted: boolean } => {
  const target = pickBlockForSkillCredit(blocks, skillKey)
  if (!target) {
    return { blocks, updatedBlock: null, newlyCompleted: false }
  }

  const { block: updatedBlock, newlyCompleted } = applyMinutesToBlock(target, creditMinutes)
  const nextBlocks = blocks.map((entry) => (entry.id === updatedBlock.id ? updatedBlock : entry))

  return { blocks: nextBlocks, updatedBlock, newlyCompleted }
}
