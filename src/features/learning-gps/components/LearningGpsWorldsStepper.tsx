import { ScrollView, Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import type { LearningWorldKeyValue, LearningWorldRecord, PlayerLearningProfileRecord } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningGpsService } from '../services/learning-gps-service'

type LearningGpsWorldsStepperProps = {
  worlds: LearningWorldRecord[]
  currentWorld: LearningWorldRecord
  profile: PlayerLearningProfileRecord
  unlockedWorldKeys: LearningWorldKeyValue[]
  completedWorldKeys: LearningWorldKeyValue[]
}

export const LearningGpsWorldsStepper = ({
  worlds,
  currentWorld,
  profile,
  unlockedWorldKeys,
  completedWorldKeys,
}: LearningGpsWorldsStepperProps) => (
  <View className="gap-3">
    <Text className="text-xs text-foreground-secondary">{LEARNING_GPS_UI.screen.worldsStepperHint}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-0.5">
      {worlds.map((entry) => {
        const unlocked = LearningGpsService.isWorldUnlocked(entry, currentWorld, unlockedWorldKeys)
        const isCurrent = entry.key === profile.currentWorldKey
        const isCompleted = completedWorldKeys.includes(entry.key)

        return (
          <GameCard
            key={entry.key}
            className={`min-w-[120px] ${
              isCurrent
                ? 'border-accent/50 bg-accent/10'
                : isCompleted
                  ? 'border-success/35 bg-success/5'
                  : unlocked
                    ? 'border-border/80'
                    : 'border-dashed border-border/50 opacity-50'
            }`}>
            <Text className="text-center text-2xl">{entry.emoji}</Text>
            <Text className="mt-1 text-center text-xs font-bold text-foreground" numberOfLines={1}>
              {entry.name}
            </Text>
            <Text className="text-center text-[10px] font-bold text-accent">{entry.cefrLevel}</Text>
            {isCurrent ? (
              <Text className="mt-1 text-center text-[9px] font-black uppercase tracking-widest text-accent">
                Atual
              </Text>
            ) : isCompleted ? (
              <Text className="mt-1 text-center text-[9px] font-black uppercase tracking-widest text-success">
                ✓
              </Text>
            ) : !unlocked ? (
              <Text className="mt-1 text-center text-[9px] text-muted">🔒</Text>
            ) : null}
          </GameCard>
        )
      })}
    </ScrollView>
  </View>
)
