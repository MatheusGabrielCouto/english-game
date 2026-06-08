import { LearningSkillKey, type LearningSkillKeyValue } from '@/types/learning-gps'

export type LearningSkillDefinition = {
  key: LearningSkillKeyValue
  label: string
  emoji: string
}

export const LEARNING_SKILLS: LearningSkillDefinition[] = [
  { key: LearningSkillKey.VOCABULARY, label: 'Vocabulário', emoji: '📝' },
  { key: LearningSkillKey.READING, label: 'Leitura', emoji: '📖' },
  { key: LearningSkillKey.LISTENING, label: 'Escuta', emoji: '🎧' },
  { key: LearningSkillKey.SPEAKING, label: 'Conversação', emoji: '🗣️' },
  { key: LearningSkillKey.WRITING, label: 'Escrita', emoji: '✍️' },
  { key: LearningSkillKey.GRAMMAR, label: 'Gramática', emoji: '📐' },
]

export const LEARNING_SKILL_BY_KEY = Object.fromEntries(
  LEARNING_SKILLS.map((skill) => [skill.key, skill]),
) as Record<LearningSkillKeyValue, LearningSkillDefinition>
