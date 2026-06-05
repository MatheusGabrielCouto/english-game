import { useCallback, useEffect } from 'react'

import { StatisticsService } from '../services/statistics-service'
import { useStatisticsStore } from '../store/statistics-store'
import { shouldRefreshStatistics } from '../utils/statistics-refresh-policy'

export const useStatistics = () => {
  const dashboard = useStatisticsStore((state) => state.dashboard)
  const isLoading = useStatisticsStore((state) => state.isLoading)
  const isRefreshing = useStatisticsStore((state) => state.isRefreshing)
  const setRefreshing = useStatisticsStore((state) => state.setRefreshing)

  const refreshDashboard = useCallback(
    async (trigger: 'mount' | 'details_expand' | 'pull') => {
      const { dashboard: cached, isLoading: hydrating } = useStatisticsStore.getState()
      if (!shouldRefreshStatistics(trigger, cached !== null, hydrating)) {
        return
      }

      const showRefreshing = trigger === 'pull'
      if (showRefreshing) {
        setRefreshing(true)
      }

      try {
        await StatisticsService.refresh()
      } finally {
        if (showRefreshing) {
          setRefreshing(false)
        }
      }
    },
    [setRefreshing],
  )

  useEffect(() => {
    void refreshDashboard('mount')
  }, [refreshDashboard])

  const handleRefresh = useCallback(async () => {
    await refreshDashboard('pull')
  }, [refreshDashboard])

  const handleDetailsExpand = useCallback(() => {
    void refreshDashboard('details_expand')
  }, [refreshDashboard])

  return {
    dashboard,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleDetailsExpand,
  }
}

export type UseStatisticsReturn = ReturnType<typeof useStatistics>
