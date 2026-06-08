import { type ReactNode } from 'react'
import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { LearningSectionHeader } from '@/features/learning/components/ui'
import { cn } from '@/utils'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorAi } from '../hooks/use-mentor-ai'
import { hasMemoryRecall } from '../utils/format-memory-recall'
import { MentorDashboardHero } from './MentorDashboardHero'
import { MentorGoalsCard } from './MentorGoalsCard'
import { MentorIntegrationHubCard } from './MentorIntegrationHubCard'
import { MentorMemoryRecallCard } from './MentorMemoryRecallCard'
import { MentorRecommendationCard } from './MentorRecommendationCard'
import { MentorShortcutGrid } from './MentorShortcutGrid'
import { MentorSkillExtremesCard } from './MentorSkillExtremesCard'

type DashboardSectionProps = {
  children: ReactNode
  className?: string
  title?: string
  hint?: string
  emoji?: string
}

const DashboardSection = ({ children, className, title, hint, emoji }: DashboardSectionProps) => (
  <View className={cn('gap-3', className)}>
    {title && emoji ? (
      <LearningSectionHeader emoji={emoji} title={title} hint={hint} />
    ) : null}
    {children}
  </View>
)

export const MentorDashboardScreenContent = () => {
  const { snapshot, hasHydrated, isSyncing } = useMentorAi()

  if (!hasHydrated || isSyncing || !snapshot) {
    return <HomeCardSkeleton />
  }

  const { context, recommendation, llmStatus, weeklyGoal, monthlyGoal, lastFeedback, greeting } =
    snapshot

  const hasFeedback = Boolean(lastFeedback?.trim())
  const showMemory = hasMemoryRecall(context.memory)

  return (
    <View className="gap-7 pb-6">
      <MentorDashboardHero greeting={greeting} context={context} />

      <DashboardSection
        emoji="📋"
        title={MENTOR_AI_UI.dashboard.todayPlanTitle}
        hint={MENTOR_AI_UI.dashboard.todayPlanHint}>
        <MentorIntegrationHubCard
          path={context.learningGps.path}
          farm={context.farm}
          motivation={context.motivation}
        />
        <MentorRecommendationCard recommendation={recommendation} />
      </DashboardSection>

      <MentorShortcutGrid />

      <DashboardSection
        emoji="📊"
        title={MENTOR_AI_UI.dashboard.progressTitle}
        hint={MENTOR_AI_UI.dashboard.progressHint}
        className="gap-3">
        <MentorSkillExtremesCard context={context} />
        <MentorGoalsCard weeklyGoal={weeklyGoal} monthlyGoal={monthlyGoal} />
        {showMemory ? <MentorMemoryRecallCard memory={context.memory} /> : null}
        {hasFeedback ? (
          <GameCard variant="default" className="gap-2 border-accent/25 bg-accent/5">
            <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
              {MENTOR_AI_UI.dashboard.lastFeedbackTitle}
            </Text>
            <Text className="text-sm leading-6 text-foreground-secondary" numberOfLines={4}>
              {lastFeedback}
            </Text>
          </GameCard>
        ) : null}
      </DashboardSection>

      <View className="border-t border-border/40 pt-4">
        <Text className="text-center text-[11px] leading-5 text-muted">
          {MENTOR_AI_UI.dashboard.engineNote(llmStatus.modelLabel)}
        </Text>
      </View>
    </View>
  )
}
