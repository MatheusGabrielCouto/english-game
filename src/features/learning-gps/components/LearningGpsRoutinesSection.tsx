import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { routes } from '@/constants'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import type { RoutineTodayItem } from '@/types/routine'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningGpsRoutineRow } from './LearningGpsRoutineRow'

type LearningGpsRoutinesSectionProps = {
  routines: RoutineTodayItem[]
  completedCount: number
  totalCount: number
  onUpdated?: () => void
}

export const LearningGpsRoutinesSection = ({
  routines,
  completedCount,
  totalCount,
  onUpdated,
}: LearningGpsRoutinesSectionProps) => {
  const handleManageRoutines = () => {
    router.push(routes.routines as Href)
  }

  return (
    <View className="gap-3">
      <HomeSectionLabel
        emoji="📋"
        title={LEARNING_GPS_UI.home.routinesTitle}
        subtitle={LEARNING_GPS_UI.home.routinesSubtitle(completedCount, totalCount)}
        tone="primary"
      />

      {routines.length === 0 ? (
        <GameCard className="border-dashed border-border/60">
          <Text className="text-sm leading-6 text-foreground-secondary">
            {LEARNING_GPS_UI.home.routinesEmpty}
          </Text>
          <View className="mt-3">
            <Button
              label={LEARNING_GPS_UI.home.manageRoutines}
              size="sm"
              variant="secondary"
              onPress={handleManageRoutines}
            />
          </View>
        </GameCard>
      ) : (
        <>
          <View className="gap-2">
            {routines.map((item) => (
              <LearningGpsRoutineRow key={item.routine.id} item={item} onUpdated={onUpdated} />
            ))}
          </View>
          <Button
            label={LEARNING_GPS_UI.home.manageRoutines}
            size="sm"
            variant="ghost"
            onPress={handleManageRoutines}
          />
        </>
      )}
    </View>
  )
}
