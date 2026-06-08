import { getTodayKey } from '@/features/quests/utils/date'
import type { MotivationDailyPickRecord } from '@/types/motivation-spark'

export const previousDateKey = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 1)

  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

const longestConsecutiveRun = (dateKeys: string[]): number => {
  if (dateKeys.length === 0) return 0

  const sorted = [...new Set(dateKeys)].sort()
  let best = 1
  let current = 1

  for (let index = 1; index < sorted.length; index += 1) {
    const expected = previousDateKey(sorted[index])
    if (sorted[index - 1] === expected) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }

  return best
}

export const computeMotivationOpenStreak = (
  picks: MotivationDailyPickRecord[],
  todayKey = getTodayKey(),
): { current: number; best: number; totalOpens: number } => {
  const openedDateKeys = picks.filter((pick) => pick.openedAt).map((pick) => pick.dateKey)
  const openedSet = new Set(openedDateKeys)
  const totalOpens = openedDateKeys.length

  let current = 0
  let cursor = openedSet.has(todayKey) ? todayKey : previousDateKey(todayKey)

  if (!openedSet.has(cursor)) {
    return {
      current: 0,
      best: longestConsecutiveRun(openedDateKeys),
      totalOpens,
    }
  }

  while (openedSet.has(cursor)) {
    current += 1
    cursor = previousDateKey(cursor)
  }

  return {
    current,
    best: Math.max(longestConsecutiveRun(openedDateKeys), current),
    totalOpens,
  }
}
