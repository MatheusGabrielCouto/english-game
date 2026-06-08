import type { DailyStudyBlock } from '@/types/learning-gps'

export const computeSkillGainForBlock = (block: Pick<DailyStudyBlock, 'minutes'>): number =>
  Math.max(1, Math.round(block.minutes / 5))

export const computeWorldProgressGainForBlock = (block: Pick<DailyStudyBlock, 'minutes'>): number =>
  Math.max(1, Math.round(block.minutes / 10))

export const clampSkillLevel = (level: number): number => Math.min(100, Math.max(0, level))

export const clampWorldProgress = (progress: number): number => Math.min(100, Math.max(0, progress))
