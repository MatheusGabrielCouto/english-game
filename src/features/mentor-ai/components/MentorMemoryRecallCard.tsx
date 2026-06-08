import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import type { MentorAIContext } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { formatGoalRecall, formatPreferenceRecall, hasMemoryRecall } from '../utils/format-memory-recall'

type MentorMemoryRecallCardProps = {
  memory: MentorAIContext['memory']
}

export const MentorMemoryRecallCard = ({ memory }: MentorMemoryRecallCardProps) => {
  if (!hasMemoryRecall(memory)) return null

  const handleManage = () => {
    router.push({ pathname: routes.mentor.history, params: { tab: 'memory' } } as Href)
  }

  return (
    <GameCard variant="default" className="gap-3 border-primary/25 bg-primary/5">
      <View className="flex-row items-start gap-2.5">
        <Text className="text-lg">🧠</Text>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            {MENTOR_AI_UI.dashboard.memoryRecallTitle}
          </Text>
          <Text className="text-xs leading-5 text-foreground-secondary">
            {MENTOR_AI_UI.dashboard.memoryRecallHint}
          </Text>
        </View>
      </View>

      {memory.goals.length > 0 ? (
        <View className="gap-1.5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.dashboard.memoryGoalsTitle}
          </Text>
          {memory.goals.slice(0, 3).map((goal) => (
            <View
              key={goal}
              className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
              <Text className="text-sm leading-5 text-foreground">{formatGoalRecall(goal)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {memory.preferences.length > 0 ? (
        <View className="gap-1.5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.dashboard.memoryPreferencesTitle}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {memory.preferences.slice(0, 4).map((preference) => (
              <View
                key={preference}
                className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1">
                <Text className="text-xs font-medium text-foreground-secondary">
                  {formatPreferenceRecall(preference)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <PressableScale
        onPress={handleManage}
        accessibilityRole="button"
        accessibilityLabel={MENTOR_AI_UI.dashboard.memoryManageLabel}
        className="self-start rounded-lg border border-border/60 px-2.5 py-1.5">
        <Text className="text-xs font-bold text-accent">
          {MENTOR_AI_UI.dashboard.memoryManageLabel} ›
        </Text>
      </PressableScale>
    </GameCard>
  )
}
