import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useHomeActiveObjectives } from '@/features/home/hooks/use-home-active-objectives'
import type { HomeActiveObjectiveTone } from '@/features/home/types/home-active-objective'
import { cn } from '@/utils'

const toneBorderClass: Record<HomeActiveObjectiveTone, string> = {
  primary: 'border-primary/25',
  accent: 'border-accent/25',
  warning: 'border-warning/25',
  gold: 'border-gold/25',
}

const toneProgressVariant: Record<
  HomeActiveObjectiveTone,
  'xp' | 'default' | 'gold'
> = {
  primary: 'xp',
  accent: 'default',
  warning: 'gold',
  gold: 'gold',
}

export const HomeActiveObjectivesCard = () => {
  const { objectives, totalCount, isLoading } = useHomeActiveObjectives()

  if (isLoading) {
    return <HomeCardSkeleton />
  }

  if (objectives.length === 0) {
    return (
      <GameCard variant="default" className="border-border/80">
        <HomeSectionLabel
          emoji="🎯"
          title={HOME_UI.activeObjectives.title}
          subtitle={HOME_UI.activeObjectives.emptySubtitle}
          tone="primary"
        />
        <Text className="mt-3 text-sm leading-5 text-foreground-secondary">
          {HOME_UI.activeObjectives.emptyBody}
        </Text>
        <View className="mt-4">
          <Button
            label={HOME_UI.activeObjectives.emptyCta}
            variant="secondary"
            onPress={() => router.push(routes.tabs.play as Href)}
          />
        </View>
      </GameCard>
    )
  }

  const overflowCount = Math.max(0, totalCount - objectives.length)

  return (
    <GameCard variant="quest" className="border-primary/30">
      <HomeSectionLabel
        emoji="🎯"
        title={HOME_UI.activeObjectives.title}
        subtitle={HOME_UI.activeObjectives.subtitle(totalCount)}
        tone="primary"
      />

      <View className="mt-4 gap-3">
        {objectives.map((objective, index) => (
          <PressableScale
            key={objective.id}
            fill
            onPress={() => router.push(objective.route)}
            accessibilityRole="button"
            accessibilityLabel={`${objective.title}. ${objective.subtitle}`}>
            <View
              className={cn(
                'gap-2 rounded-2xl border bg-surface/60 px-3 py-3',
                toneBorderClass[objective.tone],
                index < objectives.length - 1 ? '' : '',
              )}>
              <View className="flex-row items-start gap-3">
                <Text className="text-2xl">{objective.emoji}</Text>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-black text-foreground" numberOfLines={1}>
                    {objective.title}
                  </Text>
                  <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary" numberOfLines={2}>
                    {objective.subtitle}
                  </Text>
                </View>
                <Text className="shrink-0 text-sm font-bold text-primary">→</Text>
              </View>

              {objective.percent != null ? (
                <RpgProgressBar
                  value={objective.percent}
                  variant={toneProgressVariant[objective.tone]}
                  height="sm"
                  animated
                />
              ) : null}
            </View>
          </PressableScale>
        ))}
      </View>

      {overflowCount > 0 ? (
        <Text className="mt-3 text-center text-[10px] font-bold uppercase tracking-wide text-muted">
          {HOME_UI.activeObjectives.overflow(overflowCount)}
        </Text>
      ) : null}
    </GameCard>
  )
}
