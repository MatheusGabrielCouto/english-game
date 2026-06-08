import type { DailyStudyBlock } from '@/types/learning-gps'

import type { FarmGpsCreditTarget } from './map-farm-activity-to-gps'

export const pickBlockForFarmCredit = (
  blocks: DailyStudyBlock[],
  target: FarmGpsCreditTarget,
): DailyStudyBlock | null => {
  const incomplete = blocks.filter((block) => !block.completed)

  if (target.preferReviewBlock) {
    const reviewBlock = incomplete.find((block) => block.label.toLowerCase() === 'revisão')
    if (reviewBlock) return reviewBlock
  }

  return (
    incomplete.find((block) => block.skillKey === target.skillKey && block.label.toLowerCase() !== 'revisão') ??
    incomplete.find((block) => block.skillKey === target.skillKey) ??
    null
  )
}

export const applyMinutesToBlock = (
  block: DailyStudyBlock,
  creditMinutes: number,
): { block: DailyStudyBlock; newlyCompleted: boolean } => {
  const nextProgress = Math.min(block.minutes, block.progressMinutes + creditMinutes)
  const newlyCompleted = !block.completed && nextProgress >= block.minutes

  return {
    block: {
      ...block,
      progressMinutes: nextProgress,
      completed: block.completed || newlyCompleted,
    },
    newlyCompleted,
  }
}
