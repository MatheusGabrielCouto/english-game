import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import type { LearningWorldRecord, PlayerLearningProfileRecord } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'

type LearningGpsHeroSummaryProps = {
  world: LearningWorldRecord
  profile: PlayerLearningProfileRecord
  todaySummary: string
}

export const LearningGpsHeroSummary = ({
  world,
  profile,
  todaySummary,
}: LearningGpsHeroSummaryProps) => (
  <GameCard variant="hero" glow className="border-accent/35">
    <View className="flex-row items-start gap-3">
      <Text className="text-4xl">{world.emoji}</Text>
      <View className="min-w-0 flex-1">
        <Text className="text-xl font-black text-foreground">{world.name}</Text>
        <Text className="mt-0.5 text-sm font-bold text-accent">
          {LEARNING_GPS_UI.home.cefrLabel(world.cefrLevel)}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-foreground-secondary" numberOfLines={2}>
          {world.goalDescription}
        </Text>
      </View>
    </View>

    <View className="mt-4 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-muted">
          {LEARNING_GPS_UI.home.worldProgress(profile.worldProgress)}
        </Text>
        <Text className="text-xs font-semibold text-muted">{todaySummary}</Text>
      </View>
      <RpgProgressBar value={profile.worldProgress} max={100} height="md" variant="gold" animated />
    </View>
  </GameCard>
)
