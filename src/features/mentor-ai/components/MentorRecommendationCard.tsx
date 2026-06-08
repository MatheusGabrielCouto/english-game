import { type Href, router } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import type { MentorRecommendation } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorRecommendationCardProps = {
  recommendation: MentorRecommendation
}

export const MentorRecommendationCard = ({ recommendation }: MentorRecommendationCardProps) => {
  const primary = recommendation.actions[0]
  const secondaryActions = recommendation.actions.slice(1)

  const handleOpenPrimary = () => {
    if (!primary) return
    router.push(primary.route as Href)
  }

  const handleOpenAction = (route: string) => {
    router.push(route as Href)
  }

  return (
    <GameCard variant="quest" className="gap-3.5 border-accent/30">
      <View className="gap-1.5">
        <Text className="text-sm font-black text-foreground">{MENTOR_AI_UI.dashboard.nextStepTitle}</Text>
        <Text className="text-sm leading-6 text-foreground-secondary" numberOfLines={3}>
          {recommendation.insightSummary}
        </Text>
      </View>

      {primary ? (
        <Button
          label={`${primary.emoji} ${primary.label}`}
          variant="secondary"
          onPress={handleOpenPrimary}
          accessibilityLabel={primary.label}
        />
      ) : null}

      {secondaryActions.length > 0 ? (
        <View className="gap-2">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.dashboard.moreActionsLabel}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pr-1">
            {secondaryActions.map((action) => (
              <PressableScale
                key={action.id}
                onPress={() => handleOpenAction(action.route)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                className="rounded-full border border-border/60 bg-background/50 px-3 py-2">
                <Text className="text-xs font-semibold text-foreground-secondary">
                  {action.emoji} {action.label}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </GameCard>
  )
}
