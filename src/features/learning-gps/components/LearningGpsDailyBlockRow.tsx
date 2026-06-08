import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Button, ProgressBar } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import type { DailyStudyBlock } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningGpsService } from '../services/learning-gps-service'

type LearningGpsDailyBlockRowProps = {
  block: DailyStudyBlock
  onUpdated?: () => void
  compact?: boolean
  isPriority?: boolean
}

export const LearningGpsDailyBlockRow = ({
  block,
  onUpdated,
  compact = false,
  isPriority = false,
}: LearningGpsDailyBlockRowProps) => {
  const handleGoToFarm = () => {
    router.push(routes.farm as Href)
  }

  const handleMarkDone = () => {
    void LearningGpsService.completeBlock(block.id).then(() => onUpdated?.())
  }

  if (block.completed) {
    return (
      <GameCard className="border-success/35 bg-success/5 py-3">
        <View className="flex-row items-center gap-3">
          <Text className="text-lg">✅</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              {block.emoji} {block.label}
            </Text>
            <Text className="text-xs font-semibold text-success">{LEARNING_GPS_UI.home.blockCompleted}</Text>
          </View>
        </View>
      </GameCard>
    )
  }

  return (
    <GameCard
      className={
        isPriority
          ? 'border-warning/40 bg-warning/5'
          : 'border-border/80'
      }>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-foreground">
            {block.emoji} {block.label}
          </Text>
          {isPriority ? (
            <Text className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-warning">
              {LEARNING_GPS_UI.screen.priorityFocus}
            </Text>
          ) : null}
          <Text className="mt-1 text-xs font-semibold text-muted">
            {LEARNING_GPS_UI.home.blockProgress(block.progressMinutes, block.minutes)}
          </Text>
        </View>
      </View>

      <View className="mt-3">
        <ProgressBar value={block.progressMinutes} max={block.minutes} height="sm" />
      </View>

      {!compact ? (
        <View className="mt-3 gap-2">
          <Button label={LEARNING_GPS_UI.home.goToFarm} onPress={handleGoToFarm} />
          <PressableScale onPress={handleMarkDone}>
            <Text className="text-center text-sm font-semibold text-muted">
              {LEARNING_GPS_UI.home.markDone}
            </Text>
          </PressableScale>
        </View>
      ) : null}
    </GameCard>
  )
}
