import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'

import { QuestsScreenContent } from '@/features/quests'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { RoutinesScreenContent } from '@/features/routines/components/RoutinesScreenContent'
import { useRoutinesStore } from '@/features/routines/store/routines-store'

import { type PlayTab } from '../constants/play-ui'
import { PlayTabSwitcher } from './PlayTabSwitcher'

const resolveInitialTab = (tabParam?: string | string[]): PlayTab =>
  tabParam === 'routines' || (Array.isArray(tabParam) && tabParam[0] === 'routines')
    ? 'routines'
    : 'missions'

export const PlayScreenContent = () => {
  const { tab } = useLocalSearchParams<{ tab?: string | string[] }>()
  const [activeTab, setActiveTab] = useState<PlayTab>(() => resolveInitialTab(tab))

  const missions = useMissionsStore((s) => s.missions)
  const pendingRoutines = useRoutinesStore((s) => s.pendingToday.length)

  useEffect(() => {
    setActiveTab(resolveInitialTab(tab))
  }, [tab])

  const pendingMissions = useMemo(
    () => missions.filter((mission) => !mission.completed).length,
    [missions],
  )

  const tabBadges = useMemo(
    () => ({
      missions: pendingMissions,
      routines: pendingRoutines,
    }),
    [pendingMissions, pendingRoutines],
  )

  return (
    <View className="gap-5 pb-4">
      <PlayTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} badges={tabBadges} />

      {activeTab === 'missions' ? <QuestsScreenContent embedded /> : null}
      {activeTab === 'routines' ? <RoutinesScreenContent embedded /> : null}
    </View>
  )
}
