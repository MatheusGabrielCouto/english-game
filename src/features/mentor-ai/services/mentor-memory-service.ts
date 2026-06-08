import { MentorMemoryRepository } from '@/storage/repositories/mentor-memory-repository'
import { MentorMemoryKeyPrefix } from '@/types/mentor-ai'

import { createMentorId } from '../utils/create-mentor-id'
import { extractGoalsFromMessage } from '../utils/extract-goals-from-message'

const normalizeGoalKey = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')

const isSimilarGoal = (candidate: string, existing: string): boolean => {
  const left = normalizeGoalKey(candidate)
  const right = normalizeGoalKey(existing)
  if (!left || !right) return false
  if (left === right) return true
  if (left.length >= 20 && right.length >= 20) {
    return left.includes(right) || right.includes(left)
  }
  return false
}

export const MentorMemoryService = {
  async listGoals(): Promise<string[]> {
    return MentorMemoryRepository.listStringValuesByPrefix(MentorMemoryKeyPrefix.GOAL)
  },

  async addGoal(text: string): Promise<boolean> {
    const value = text.trim()
    if (!value) return false

    const existing = await MentorMemoryService.listGoals()
    if (existing.some((goal) => isSimilarGoal(value, goal))) return false

    await MentorMemoryRepository.set(`${MentorMemoryKeyPrefix.GOAL}${createMentorId('goal')}`, value)
    return true
  },

  async addPreference(text: string): Promise<boolean> {
    const value = text.trim()
    if (!value) return false

    const existing = await MentorMemoryRepository.listStringValuesByPrefix(
      MentorMemoryKeyPrefix.PREFERENCE,
    )
    if (existing.some((pref) => normalizeGoalKey(pref) === normalizeGoalKey(value))) return false

    await MentorMemoryRepository.set(
      `${MentorMemoryKeyPrefix.PREFERENCE}${createMentorId('pref')}`,
      value,
    )
    return true
  },

  async extractAndSaveGoalsFromMessage(message: string): Promise<string[]> {
    const candidates = extractGoalsFromMessage(message)
    if (candidates.length === 0) return []

    const existing = await MentorMemoryService.listGoals()
    const saved: string[] = []

    for (const candidate of candidates) {
      if (existing.some((goal) => isSimilarGoal(candidate, goal))) continue
      if (saved.some((goal) => isSimilarGoal(candidate, goal))) continue

      await MentorMemoryRepository.set(
        `${MentorMemoryKeyPrefix.GOAL}${createMentorId('goal')}`,
        candidate,
      )

      existing.push(candidate)
      saved.push(candidate)
    }

    return saved
  },
}
