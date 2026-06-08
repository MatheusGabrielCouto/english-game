import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import type { MentorAIContext, MentorGreeting } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorLlmStore } from '../store/mentor-llm-store'

type MentorDashboardHeroProps = {
  greeting: MentorGreeting
  context: MentorAIContext
}

const resolveLlmBadge = (status: ReturnType<typeof useMentorLlmStore.getState>['status']): string => {
  switch (status) {
    case 'ready':
      return MENTOR_AI_UI.dashboard.llmReady
    case 'copying':
    case 'loading':
      return MENTOR_AI_UI.dashboard.llmPreparing
    case 'missing':
    case 'error':
      return MENTOR_AI_UI.dashboard.llmFallback
    default:
      return MENTOR_AI_UI.home.offlineBadge
  }
}

export const MentorDashboardHero = ({ greeting, context }: MentorDashboardHeroProps) => {
  const llmStatus = useMentorLlmStore((state) => state.status)
  const worldProgress = Math.round(context.learningGps.worldProgress)

  return (
    <GameCard variant="hero" glow className="overflow-hidden border-accent/40 bg-accent/5">
      <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
      <View className="relative gap-2.5">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              {MENTOR_AI_UI.characterName}
            </Text>
            <Text className="text-lg font-black leading-snug text-foreground" numberOfLines={2}>
              {greeting.headline}
            </Text>
          </View>
          <View className="rounded-full border border-accent/35 bg-accent/15 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-accent">{resolveLlmBadge(llmStatus)}</Text>
          </View>
        </View>

        <Text className="text-xs leading-5 text-foreground-secondary" numberOfLines={3}>
          {greeting.subtitle}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-foreground-secondary">
              {MENTOR_AI_UI.dashboard.levelChip(context.player.level)}
            </Text>
          </View>
          <View className="rounded-full border border-gold/35 bg-gold/10 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-gold">
              {MENTOR_AI_UI.dashboard.streakChip(context.player.streak)}
            </Text>
          </View>
          <View className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-primary">
              {MENTOR_AI_UI.dashboard.worldChip(worldProgress)}
            </Text>
          </View>
        </View>
      </View>
    </GameCard>
  )
}
