import type { MentorErrorLogRecord } from '@/types/mentor-ai'

import { formatMentorErrorCategory } from './format-error-category'

export type MentorErrorPracticePlan = {
  topicLabel: string
  title: string
  topCategories: string[]
  llmPrompt: string
}

const normalizeOriginal = (value: string): string =>
  value.toLowerCase().trim().replace(/\s+/g, ' ')

export const dedupeErrors = (errors: MentorErrorLogRecord[]): MentorErrorLogRecord[] => {
  const seen = new Set<string>()
  const unique: MentorErrorLogRecord[] = []

  for (const entry of errors) {
    const key = normalizeOriginal(entry.original)
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(entry)
  }

  return unique
}

const rankCategories = (errors: MentorErrorLogRecord[]): string[] => {
  const counts = errors.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
}

export const buildErrorPracticePlan = (errors: MentorErrorLogRecord[]): MentorErrorPracticePlan => {
  const unique = dedupeErrors(errors)
  const topCategories = rankCategories(unique)
  const categoryLabels = topCategories.map(formatMentorErrorCategory)
  const examples = unique
    .slice(0, 6)
    .map((entry) => `- [${formatMentorErrorCategory(entry.category)}] "${entry.original}" → "${entry.corrected}"`)
    .join('\n')

  const focus =
    categoryLabels.length > 0
      ? categoryLabels.slice(0, 3).join(', ')
      : 'gramática e vocabulário'

  return {
    topicLabel: 'Meus erros frequentes',
    title: 'Quiz dos meus erros',
    topCategories,
    llmPrompt: [
      `Create 5 multiple-choice exercises focused on the student's frequent mistakes.`,
      `Priority categories: ${focus}.`,
      'Use these real corrections as inspiration (do not copy verbatim every time):',
      examples,
      'Mix sentence-choice and fill-in-the-blank styles.',
      'Target the same error patterns shown above.',
    ].join('\n'),
  }
}
