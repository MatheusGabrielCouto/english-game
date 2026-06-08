import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { routes } from '@/constants'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorStubScreenContentProps = {
  title: string
  body: string
}

export const MentorStubScreenContent = ({ title, body }: MentorStubScreenContentProps) => (
  <View className="gap-4 pb-6">
    <GameCard variant="default" className="gap-3">
      <Text className="text-lg font-black text-foreground">{title}</Text>
      <Text className="text-sm leading-6 text-foreground-secondary">{body}</Text>
      <Button
        label={MENTOR_AI_UI.stubs.backToDashboard}
        variant="secondary"
        onPress={() => router.push(routes.mentor.dashboard as Href)}
      />
    </GameCard>
  </View>
)
