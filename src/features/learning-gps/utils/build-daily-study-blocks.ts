import {
    DIFFICULTY_CONFIG,
    LearningDifficulty,
    type LearningDifficultyValue,
} from '@/features/game-design/constants/difficulty'
import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import { LearningSkillKey, type DailyStudyBlock } from '@/types/learning-gps'

type BlockTemplate = {
  skillKey: (typeof LearningSkillKey)[keyof typeof LearningSkillKey]
  minutes: number
  label?: string
  emoji?: string
}

const DAILY_PLAN_BY_DIFFICULTY: Record<LearningDifficultyValue, BlockTemplate[]> = {
  [LearningDifficulty.CASUAL]: [
    { skillKey: LearningSkillKey.VOCABULARY, minutes: 5 },
    { skillKey: LearningSkillKey.READING, minutes: 5 },
    { skillKey: LearningSkillKey.VOCABULARY, minutes: 5, label: 'Revisão', emoji: '🔄' },
  ],
  [LearningDifficulty.BALANCED]: [
    { skillKey: LearningSkillKey.VOCABULARY, minutes: 10 },
    { skillKey: LearningSkillKey.READING, minutes: 10 },
    { skillKey: LearningSkillKey.LISTENING, minutes: 10 },
  ],
  [LearningDifficulty.SERIOUS]: [
    { skillKey: LearningSkillKey.VOCABULARY, minutes: 15 },
    { skillKey: LearningSkillKey.READING, minutes: 15 },
    { skillKey: LearningSkillKey.LISTENING, minutes: 15 },
    { skillKey: LearningSkillKey.SPEAKING, minutes: 15 },
  ],
  [LearningDifficulty.HARDCORE]: [
    { skillKey: LearningSkillKey.VOCABULARY, minutes: 20 },
    { skillKey: LearningSkillKey.READING, minutes: 20 },
    { skillKey: LearningSkillKey.LISTENING, minutes: 20 },
    { skillKey: LearningSkillKey.SPEAKING, minutes: 15 },
    { skillKey: LearningSkillKey.WRITING, minutes: 15 },
  ],
}

const slugifyBlockLabel = (label: string): string =>
  label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')

export const buildBlockId = (index: number, label: string): string =>
  `${index}-${slugifyBlockLabel(label)}`

export const buildDailyStudyBlocks = (
  difficulty: LearningDifficultyValue,
  progress: Record<string, { progressMinutes: number; completedAt?: string }> = {},
): DailyStudyBlock[] =>
  DAILY_PLAN_BY_DIFFICULTY[difficulty].map((block, index) => {
    const skill = LEARNING_SKILL_BY_KEY[block.skillKey]
    const label = block.label ?? skill.label
    const id = buildBlockId(index, label)
    const entry = progress[id]

    return {
      id,
      skillKey: block.skillKey,
      minutes: block.minutes,
      label,
      emoji: block.emoji ?? skill.emoji,
      progressMinutes: entry?.progressMinutes ?? 0,
      completed: Boolean(entry?.completedAt),
    }
  })

export const getTargetMinutesForDifficulty = (difficulty: LearningDifficultyValue): number =>
  DIFFICULTY_CONFIG[difficulty].targetMinutes
