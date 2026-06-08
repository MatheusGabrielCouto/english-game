import { router, type Href } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import type { LearningGpsNextStep } from '../utils/resolve-next-step'

type LearningGpsNextStepCardProps = {
  nextStep: LearningGpsNextStep
}

export const LearningGpsNextStepCard = ({ nextStep }: LearningGpsNextStepCardProps) => {
  const handleCta = () => {
    if (nextStep.kind === 'done') return
    router.push(nextStep.route as Href)
  }

  const isDone = nextStep.kind === 'done'

  return (
    <GameCard
      variant={isDone ? 'reward' : 'quest'}
      glow={!isDone}
      className={isDone ? 'border-success/40 bg-success/5' : 'border-primary/35'}>
      <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
        {isDone ? LEARNING_GPS_UI.screen.nextStepDone : LEARNING_GPS_UI.screen.nextStepTitle}
      </Text>

      <View className="mt-3 flex-row items-start gap-3">
        <Text className="text-3xl">{nextStep.emoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-black text-foreground">{nextStep.title}</Text>
          <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{nextStep.description}</Text>
        </View>
      </View>

      {!isDone ? (
        <View className="mt-4">
          <Button label={nextStep.ctaLabel} onPress={handleCta} />
        </View>
      ) : null}
    </GameCard>
  )
}
