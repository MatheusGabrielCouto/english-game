import { getTodayKey } from '@/features/quests/utils/date'

import type { LearningWeeklyPlanSnapshot } from '@/types/learning-gps'
import { DEFAULT_WEEKLY_PLAN_DAYS, WEEKLY_PROJECTS } from '../constants/weekly-plan'

const dateFromKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export const getWeekPeriodKey = (dateKey = getTodayKey()): string => {
  const date = dateFromKey(dateKey)
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export const buildWeeklyPlanSnapshot = (dateKey = getTodayKey()): LearningWeeklyPlanSnapshot => {
  const todayWeekday = dateFromKey(dateKey).getUTCDay()
  const weekKey = getWeekPeriodKey(dateKey)
  const project = WEEKLY_PROJECTS[weekKey.length % WEEKLY_PROJECTS.length]

  return {
    weekKey,
    days: DEFAULT_WEEKLY_PLAN_DAYS.map((day) => ({
      ...day,
      isToday: day.weekday === todayWeekday,
    })),
    projectTitle: project.title,
    projectDescription: project.description,
    projectEmoji: project.emoji,
  }
}
