import { LearningWorldKey, type LearningCurriculumUnitDefinition, type LearningWorldKeyValue } from '@/types/learning-gps'

import { DEVELOPER_CURRICULUM_UNITS } from './developer-curriculum'
import { EXPLORER_CURRICULUM_UNITS } from './explorer-curriculum'
import { GLOBAL_ENGINEER_CURRICULUM_UNITS } from './global-engineer-curriculum'
import { LEGEND_CURRICULUM_UNITS } from './legend-curriculum'
import { PROFESSIONAL_CURRICULUM_UNITS } from './professional-curriculum'
import { SURVIVOR_CURRICULUM_UNITS } from './survivor-curriculum'

const CURRICULUM_BY_WORLD: Record<LearningWorldKeyValue, LearningCurriculumUnitDefinition[]> = {
  [LearningWorldKey.SURVIVOR]: SURVIVOR_CURRICULUM_UNITS,
  [LearningWorldKey.EXPLORER]: EXPLORER_CURRICULUM_UNITS,
  [LearningWorldKey.PROFESSIONAL]: PROFESSIONAL_CURRICULUM_UNITS,
  [LearningWorldKey.DEVELOPER]: DEVELOPER_CURRICULUM_UNITS,
  [LearningWorldKey.GLOBAL_ENGINEER]: GLOBAL_ENGINEER_CURRICULUM_UNITS,
  [LearningWorldKey.LEGEND]: LEGEND_CURRICULUM_UNITS,
}

export const getCurriculumForWorld = (
  worldKey: LearningWorldKeyValue,
): LearningCurriculumUnitDefinition[] => {
  const units = CURRICULUM_BY_WORLD[worldKey] ?? []
  return [...units].sort((a, b) => a.sortOrder - b.sortOrder)
}

export const getAllCurriculumWorldKeys = (): LearningWorldKeyValue[] =>
  Object.keys(CURRICULUM_BY_WORLD) as LearningWorldKeyValue[]
