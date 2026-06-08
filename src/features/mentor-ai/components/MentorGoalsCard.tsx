import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorGoalsCardProps = {
  weeklyGoal: string | null
  monthlyGoal: string | null
}

export const MentorGoalsCard = ({ weeklyGoal, monthlyGoal }: MentorGoalsCardProps) => (
  <GameCard variant="default" className="gap-3">
    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
      {MENTOR_AI_UI.dashboard.goalsTitle}
    </Text>

    <View className="gap-2">
      <View className="flex-row gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
        <Text className="text-lg">📅</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.dashboard.weeklyGoalTitle}
          </Text>
          <Text className="mt-0.5 text-sm leading-5 text-foreground-secondary">
            {weeklyGoal ?? MENTOR_AI_UI.dashboard.noWeeklyGoal}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
        <Text className="text-lg">🎯</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.dashboard.monthlyGoalTitle}
          </Text>
          <Text className="mt-0.5 text-sm leading-5 text-foreground-secondary">
            {monthlyGoal ?? MENTOR_AI_UI.dashboard.noMonthlyGoal}
          </Text>
        </View>
      </View>
    </View>
  </GameCard>
)
