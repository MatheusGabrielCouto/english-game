import { getSkillLabel } from '@/features/learning-gps/utils/detect-skill-weaknesses'
import type {
    LearningCurriculumSnapshot,
    LearningMonthlyReport,
    LearningSkillWeakness,
    LearningWorldRecord,
    PlayerLearningProfileRecord,
    SkillLevelRecord,
} from '@/types/learning-gps'

const getMonthKey = (dateKey: string): string => dateKey.slice(0, 7)

export const buildMonthlyGoals = (input: {
  weaknesses: LearningSkillWeakness[]
  world: LearningWorldRecord
  curriculum: LearningCurriculumSnapshot | null
}): string[] => {
  const goals: string[] = []

  if (input.curriculum && !input.curriculum.checkpointCompleted) {
    const remaining = input.curriculum.totalCount - input.curriculum.completedCount
    goals.push(`Concluir ${remaining} unidade(s) do mundo ${input.world.name}.`)
  }

  input.weaknesses
    .filter((weakness) => weakness.priority === 'high')
    .slice(0, 2)
    .forEach((weakness) => {
      goals.push(`Elevar ${getSkillLabel(weakness.skillKey)} para perto da média (${weakness.averageOthers}+).`)
    })

  if (goals.length === 0) {
    goals.push(`Manter consistência diária no mundo ${input.world.name} (${input.world.cefrLevel}).`)
  }

  return goals
}

export const buildMonthlySummary = (input: {
  monthKey: string
  world: LearningWorldRecord
  profile: PlayerLearningProfileRecord
  skills: SkillLevelRecord[]
  weaknesses: LearningSkillWeakness[]
}): string => {
  const averageSkill = Math.round(
    input.skills.reduce((sum, skill) => sum + skill.level, 0) / Math.max(input.skills.length, 1),
  )
  const weakCount = input.weaknesses.filter((weakness) => weakness.priority === 'high').length

  if (weakCount > 0) {
    return `Em ${input.monthKey}, você está no mundo ${input.world.name} (${input.world.cefrLevel}) com média de skills em ${averageSkill}. Foco em ${weakCount} área(s) para equilibrar o perfil.`
  }

  return `Em ${input.monthKey}, perfil equilibrado no mundo ${input.world.name} — média ${averageSkill}/100 e ${input.profile.worldProgress}% do mundo concluído.`
}

export const buildMonthlyReport = (input: {
  dateKey: string
  profile: PlayerLearningProfileRecord
  world: LearningWorldRecord
  skills: SkillLevelRecord[]
  weaknesses: LearningSkillWeakness[]
  curriculum: LearningCurriculumSnapshot | null
}): LearningMonthlyReport => {
  const monthKey = getMonthKey(input.dateKey)
  const goals = buildMonthlyGoals({
    weaknesses: input.weaknesses,
    world: input.world,
    curriculum: input.curriculum,
  })

  return {
    monthKey,
    generatedAt: new Date().toISOString(),
    worldName: input.world.name,
    worldCefr: input.world.cefrLevel,
    worldProgress: input.profile.worldProgress,
    skills: input.skills,
    weaknesses: input.weaknesses,
    goals,
    summary: buildMonthlySummary({
      monthKey,
      world: input.world,
      profile: input.profile,
      skills: input.skills,
      weaknesses: input.weaknesses,
    }),
    curriculumCompleted: input.curriculum?.completedCount ?? 0,
    curriculumTotal: input.curriculum?.totalCount ?? 0,
  }
}

export const getCurrentMonthKey = (dateKey: string): string => getMonthKey(dateKey)
