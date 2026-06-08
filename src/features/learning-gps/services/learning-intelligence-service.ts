import { getTodayKey } from '@/features/quests/utils/date'
import { LearningIntelligenceRepository } from '@/storage/repositories/learning-intelligence-repository'
import type {
    LearningCurriculumSnapshot,
    LearningIntelligenceSnapshot,
    LearningWorldRecord,
    PlayerLearningProfileRecord,
    SkillLevelRecord,
} from '@/types/learning-gps'
import type { RoutineTodayItem } from '@/types/routine'

import { buildMonthlyReport, getCurrentMonthKey } from '../utils/build-monthly-report'
import { buildPersonalizedMissions } from '../utils/build-personalized-missions'
import { buildWeeklyPlanSnapshot } from '../utils/build-weekly-plan'
import { detectSkillWeaknesses, getPrioritySkillKeys } from '../utils/detect-skill-weaknesses'

const ensureMonthlyReport = async (input: {
  dateKey: string
  profile: PlayerLearningProfileRecord
  world: LearningWorldRecord
  skills: SkillLevelRecord[]
  curriculum: LearningCurriculumSnapshot | null
}): Promise<LearningIntelligenceSnapshot['monthlyReport']> => {
  const monthKey = getCurrentMonthKey(input.dateKey)
  const existing = await LearningIntelligenceRepository.findByMonthKey(monthKey)
  if (existing) return existing

  const weaknesses = detectSkillWeaknesses(input.skills)
  const report = buildMonthlyReport({
    dateKey: input.dateKey,
    profile: input.profile,
    world: input.world,
    skills: input.skills,
    weaknesses,
    curriculum: input.curriculum,
  })

  return LearningIntelligenceRepository.saveReport(report)
}

export const LearningIntelligenceService = {
  async buildSnapshot(input: {
    profile: PlayerLearningProfileRecord
    world: LearningWorldRecord
    skills: SkillLevelRecord[]
    curriculum: LearningCurriculumSnapshot | null
    todayRoutines: RoutineTodayItem[]
    dateKey?: string
  }): Promise<LearningIntelligenceSnapshot> {
    const dateKey = input.dateKey ?? getTodayKey()
    const weaknesses = detectSkillWeaknesses(input.skills)
    const prioritySkillKeys = getPrioritySkillKeys(weaknesses)

    const [monthlyReport, weeklyPlan] = await Promise.all([
      ensureMonthlyReport({
        dateKey,
        profile: input.profile,
        world: input.world,
        skills: input.skills,
        curriculum: input.curriculum,
      }),
      Promise.resolve(buildWeeklyPlanSnapshot(dateKey)),
    ])

    const missions = buildPersonalizedMissions({
      weaknesses,
      curriculum: input.curriculum,
      todayRoutines: input.todayRoutines,
      world: input.world,
    })

    return {
      weaknesses,
      prioritySkillKeys,
      missions,
      weeklyPlan,
      monthlyReport,
    }
  },
}
