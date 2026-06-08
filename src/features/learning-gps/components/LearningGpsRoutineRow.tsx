import { useState } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { ROUTINE_CATEGORY_LABELS } from '@/features/routines/constants/routine-ui'
import { RoutineService } from '@/features/routines/services/routine-service'
import type { RoutineTodayItem } from '@/types/routine'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'

type LearningGpsRoutineRowProps = {
  item: RoutineTodayItem
  compact?: boolean
  onUpdated?: () => void
}

export const LearningGpsRoutineRow = ({
  item,
  compact = false,
  onUpdated,
}: LearningGpsRoutineRowProps) => {
  const [loading, setLoading] = useState(false)
  const { routine, completed } = item
  const categoryLabel = ROUTINE_CATEGORY_LABELS[routine.category]

  const handleToggle = () => {
    setLoading(true)
    const action = completed
      ? RoutineService.uncomplete(routine.id)
      : RoutineService.complete(routine.id)

    void action.finally(() => {
      setLoading(false)
      onUpdated?.()
    })
  }

  return (
    <GameCard
      className={
        completed
          ? 'border-success/35 bg-success/5'
          : 'border-border/80'
      }>
      <View className="flex-row items-start gap-3">
        <Text className="text-xl">{completed ? '✅' : '📋'}</Text>
        <View className="min-w-0 flex-1">
          <Text className="font-bold text-foreground">{routine.name}</Text>
          {!compact && routine.description ? (
            <Text className="mt-1 text-sm leading-5 text-foreground-secondary" numberOfLines={2}>
              {routine.description}
            </Text>
          ) : null}
          <Text className="mt-1 text-xs font-semibold text-muted">{categoryLabel}</Text>
          <Text className="mt-1 text-xs font-semibold text-accent">
            {completed ? LEARNING_GPS_UI.home.routineCompleted : LEARNING_GPS_UI.home.routinePending}
          </Text>
        </View>
      </View>

      <View className="mt-3">
        <Button
          label={completed ? LEARNING_GPS_UI.home.routineUncomplete : LEARNING_GPS_UI.home.routineComplete}
          size="sm"
          variant={completed ? 'ghost' : 'secondary'}
          onPress={handleToggle}
          loading={loading}
          disabled={loading}
        />
      </View>
    </GameCard>
  )
}
