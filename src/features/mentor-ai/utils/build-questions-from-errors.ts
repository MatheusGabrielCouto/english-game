import { shuffleMcqChoices } from '@/features/learning/utils/mcq-distractors'
import type { MentorErrorLogRecord, MentorExerciseQuestion, MentorExerciseSet } from '@/types/mentor-ai'

import { formatMentorErrorCategory } from './format-error-category'
import { buildErrorPracticePlan, dedupeErrors } from './build-error-practice-plan'

const TARGET_QUESTION_COUNT = 5

const CATEGORY_SUPPLEMENT_TOPIC: Record<string, string> = {
  grammar_tense: 'past simple',
  grammar_agreement: 'past simple',
  preposition: 'past simple',
  article: 'past simple',
  word_order: 'past simple',
  collocation: 'travel vocabulary',
  vocabulary: 'travel vocabulary',
  other: 'past simple',
}

const uniqueOptions = (options: string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const option of options) {
    const trimmed = option.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }

  return result
}

const pickDistractors = (
  entry: MentorErrorLogRecord,
  pool: MentorErrorLogRecord[],
): string[] => {
  const distractors = pool
    .filter((candidate) => candidate.id !== entry.id)
    .map((candidate) => candidate.original)
    .filter((original) => original.toLowerCase() !== entry.corrected.toLowerCase())

  return uniqueOptions(distractors).slice(0, 2)
}

const buildQuestionFromError = (
  entry: MentorErrorLogRecord,
  pool: MentorErrorLogRecord[],
  index: number,
): MentorExerciseQuestion => {
  const distractors = pickDistractors(entry, pool)
  const options = uniqueOptions([entry.corrected, entry.original, ...distractors])

  const genericWrong = [
    `Maybe: "${entry.original.replace(/\.$/, '')}, right?"`,
    `Keep it as: "${entry.original}"`,
  ]

  for (const filler of genericWrong) {
    if (options.length >= 4) break
    options.push(filler)
  }

  const shuffled = shuffleMcqChoices(options.slice(0, 4), `mentor-error-practice-${entry.id}-${index}`)
  const correctIndex = shuffled.findIndex(
    (option) => option.toLowerCase() === entry.corrected.toLowerCase(),
  )

  return {
    prompt: `Which sentence is correct? (Your mistake: "${entry.original}")`,
    options: shuffled,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: `${formatMentorErrorCategory(entry.category)}: "${entry.corrected}" é a forma correta.`,
  }
}

export const buildExerciseSetFromErrors = (
  errors: MentorErrorLogRecord[],
  supplementQuestions: MentorExerciseQuestion[] = [],
): MentorExerciseSet | null => {
  const unique = dedupeErrors(errors)
  if (unique.length === 0) return null

  const plan = buildErrorPracticePlan(unique)
  const personalized = unique
    .slice(0, TARGET_QUESTION_COUNT)
    .map((entry, index) => buildQuestionFromError(entry, unique, index))

  const questions = [...personalized]

  for (const question of supplementQuestions) {
    if (questions.length >= TARGET_QUESTION_COUNT) break
    const isDuplicate = questions.some(
      (existing) => existing.prompt.toLowerCase() === question.prompt.toLowerCase(),
    )
    if (!isDuplicate) questions.push(question)
  }

  return {
    topic: 'my_frequent_errors',
    title: plan.title,
    questions: questions.slice(0, TARGET_QUESTION_COUNT),
  }
}

export const resolveSupplementTopic = (errors: MentorErrorLogRecord[]): string => {
  const plan = buildErrorPracticePlan(errors)
  const topCategory = plan.topCategories[0]
  if (!topCategory) return 'past simple'
  return CATEGORY_SUPPLEMENT_TOPIC[topCategory] ?? 'past simple'
}
