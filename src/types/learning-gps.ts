import type { RoutineTodayItem } from '@/types/routine'

export const LearningSkillKey = {
  VOCABULARY: 'vocabulary',
  READING: 'reading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  WRITING: 'writing',
  GRAMMAR: 'grammar',
} as const

export type LearningSkillKeyValue = (typeof LearningSkillKey)[keyof typeof LearningSkillKey]

export const LearningWorldKey = {
  SURVIVOR: 'survivor',
  EXPLORER: 'explorer',
  PROFESSIONAL: 'professional',
  DEVELOPER: 'developer',
  GLOBAL_ENGINEER: 'global_engineer',
  LEGEND: 'legend',
} as const

export type LearningWorldKeyValue = (typeof LearningWorldKey)[keyof typeof LearningWorldKey]

export type LearningWorldRecord = {
  key: LearningWorldKeyValue
  name: string
  emoji: string
  cefrLevel: string
  sortOrder: number
  estimatedDaysMin: number
  estimatedDaysMax: number
  goalDescription: string
  description: string | null
}

export type PlayerLearningProfileRecord = {
  id: number
  currentWorldKey: LearningWorldKeyValue
  worldProgress: number
  learningGpsOnboarded: boolean
  onboardedAt: string | null
  updatedAt: string
}

export type SkillLevelRecord = {
  skillKey: LearningSkillKeyValue
  level: number
  updatedAt: string
}

export type DailyStudyBlock = {
  id: string
  skillKey: LearningSkillKeyValue
  minutes: number
  label: string
  emoji: string
  progressMinutes: number
  completed: boolean
}

export type LearningDailyPlanRecord = {
  dateKey: string
  difficulty: string
  blockProgress: Record<string, { progressMinutes: number; completedAt?: string }>
  updatedAt: string
}

export const LearningUnitKind = {
  VOCABULARY: 'vocabulary',
  GRAMMAR: 'grammar',
  SPEAKING: 'speaking',
  CHECKPOINT: 'checkpoint',
} as const

export type LearningUnitKindValue = (typeof LearningUnitKind)[keyof typeof LearningUnitKind]

export const LearningUnitStatus = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const

export type LearningUnitStatusValue = (typeof LearningUnitStatus)[keyof typeof LearningUnitStatus]

export type LearningCurriculumUnitDefinition = {
  key: string
  worldKey: LearningWorldKeyValue
  kind: LearningUnitKindValue
  title: string
  emoji: string
  description: string
  practiceRoute: string
  practiceLabel: string
  practiceActivity?: string
  requiredPracticeAmount: number
  sortOrder: number
}

export type LearningUnitProgressRecord = {
  unitKey: string
  worldKey: LearningWorldKeyValue
  status: LearningUnitStatusValue
  practiceProgress: number
  completedAt: string | null
  updatedAt: string
}

export type LearningCurriculumUnitView = LearningCurriculumUnitDefinition & {
  progress: LearningUnitProgressRecord
}

export type LearningCurriculumSnapshot = {
  worldKey: LearningWorldKeyValue
  units: LearningCurriculumUnitView[]
  completedCount: number
  totalCount: number
  checkpointCompleted: boolean
}

export type LearningSkillWeaknessPriority = 'high' | 'medium' | 'low'

export type LearningSkillWeakness = {
  skillKey: LearningSkillKeyValue
  level: number
  averageOthers: number
  gapPercent: number
  priority: LearningSkillWeaknessPriority
}

export type LearningPersonalizedMissionSource = 'weakness' | 'world' | 'routine'

export type LearningPersonalizedMission = {
  id: string
  skillKey: LearningSkillKeyValue
  title: string
  description: string
  emoji: string
  practiceRoute: string
  practiceLabel: string
  source: LearningPersonalizedMissionSource
  priority: number
}

export type LearningWeeklyDayPlan = {
  weekday: number
  label: string
  focusSkills: LearningSkillKeyValue[]
  isProjectDay: boolean
  isReviewDay: boolean
  isSpeakingDay: boolean
  isToday: boolean
}

export type LearningWeeklyPlanSnapshot = {
  weekKey: string
  days: LearningWeeklyDayPlan[]
  projectTitle: string
  projectDescription: string
  projectEmoji: string
}

export type LearningMonthlyReport = {
  monthKey: string
  generatedAt: string
  worldName: string
  worldCefr: string
  worldProgress: number
  skills: SkillLevelRecord[]
  weaknesses: LearningSkillWeakness[]
  goals: string[]
  summary: string
  curriculumCompleted: number
  curriculumTotal: number
}

export type LearningIntelligenceSnapshot = {
  weaknesses: LearningSkillWeakness[]
  prioritySkillKeys: LearningSkillKeyValue[]
  missions: LearningPersonalizedMission[]
  weeklyPlan: LearningWeeklyPlanSnapshot
  monthlyReport: LearningMonthlyReport
}

export type LearningGpsSnapshot = {
  profile: PlayerLearningProfileRecord
  world: LearningWorldRecord
  skills: SkillLevelRecord[]
  todayBlocks: DailyStudyBlock[]
  todayRoutines: RoutineTodayItem[]
  targetMinutes: number
  completedBlocksCount: number
  totalBlocksCount: number
  completedRoutinesCount: number
  totalRoutinesCount: number
  curriculum: LearningCurriculumSnapshot | null
  unlockedWorldKeys: LearningWorldKeyValue[]
  completedWorldKeys: LearningWorldKeyValue[]
  intelligence: LearningIntelligenceSnapshot
  prioritySkillKeys: LearningSkillKeyValue[]
}
