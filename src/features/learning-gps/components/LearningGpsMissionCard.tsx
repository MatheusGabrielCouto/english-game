import { router, type Href } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import type { LearningPersonalizedMission } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'

type LearningGpsMissionCardProps = {
  mission: LearningPersonalizedMission
}

export const LearningGpsMissionCard = ({ mission }: LearningGpsMissionCardProps) => {
  const sourceLabel = LEARNING_GPS_UI.screen.missionSource[mission.source]

  const handlePractice = () => {
    router.push(mission.practiceRoute as Href)
  }

  return (
    <GameCard className="border-primary/25 bg-primary/5">
      <View className="flex-row items-start gap-3">
        <Text className="text-2xl">{mission.emoji}</Text>
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-bold text-foreground">{mission.title}</Text>
            <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
              {sourceLabel}
            </Text>
          </View>
          <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{mission.description}</Text>
        </View>
      </View>
      <View className="mt-3">
        <Button label={mission.practiceLabel} size="sm" variant="secondary" onPress={handlePractice} />
      </View>
    </GameCard>
  )
}
