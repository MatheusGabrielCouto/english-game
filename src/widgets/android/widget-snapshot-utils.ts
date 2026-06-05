import { getTodayKey } from '@/features/quests/utils/date'

export const shouldRefreshWidgetForDate = (lastUpdatedAt: string): boolean => {
  const updatedDay = lastUpdatedAt.slice(0, 10)
  return updatedDay !== getTodayKey()
}
