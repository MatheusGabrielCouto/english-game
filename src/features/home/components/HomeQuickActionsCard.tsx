import { router, type Href } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes, TOUCH_TARGET_MIN_CLASS } from '@/constants'
import {
    getHomeQuickActionsForDisplay,
    type HomeQuickActionDef,
} from '@/features/home/constants/home-quick-actions'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useExploreBadges, type ExploreBadge } from '@/features/profile/hooks/use-explore-badges'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { cn } from '@/utils'

const badgeToneStyles = {
  default: 'bg-surface border-border',
  live: 'bg-danger/15 border-danger/40',
  reward: 'bg-gold/15 border-gold/40',
  quest: 'bg-primary/15 border-primary/40',
  locked: 'bg-muted/10 border-border',
} as const

const badgeTextStyles = {
  default: 'text-foreground-secondary',
  live: 'text-danger',
  reward: 'text-gold',
  quest: 'text-primary',
  locked: 'text-muted',
} as const

type QuickActionTileProps = {
  action: HomeQuickActionDef
  badge: ExploreBadge | { label: string; tone: ExploreBadge['tone'] }
}

const QuickActionTile = ({ action, badge }: QuickActionTileProps) => (
  <PressableScale
    onPress={() => router.push(action.route)}
    accessibilityRole="button"
    accessibilityLabel={`${action.label}. ${action.tagline}`}
    className={cn(TOUCH_TARGET_MIN_CLASS, 'w-[31%] min-w-[100px] grow')}>
    <View className="relative min-h-[92px] rounded-2xl border border-border bg-surface px-2.5 py-3">
      {badge.label ? (
        <View
          className={cn(
            'absolute right-1.5 top-1.5 max-w-[88px] rounded-md border px-1.5 py-0.5',
            badgeToneStyles[badge.tone],
          )}>
          <Text
            className={cn('text-center text-[9px] font-bold', badgeTextStyles[badge.tone])}
            numberOfLines={1}>
            {badge.label}
          </Text>
        </View>
      ) : null}
      <Text className="text-2xl">{action.emoji}</Text>
      <Text className="mt-2 text-xs font-bold text-foreground" numberOfLines={1}>
        {action.label}
      </Text>
      <Text className="mt-0.5 text-[10px] leading-3.5 text-foreground-secondary" numberOfLines={2}>
        {action.tagline}
      </Text>
    </View>
  </PressableScale>
)

const MoreQuickActionTile = () => (
  <PressableScale
    onPress={() => router.push(routes.tabs.menu as Href)}
    accessibilityRole="button"
    accessibilityLabel={`${HOME_UI.quickActions.moreLabel}. ${HOME_UI.quickActions.moreTagline}`}
    className={cn(TOUCH_TARGET_MIN_CLASS, 'w-[31%] min-w-[100px] grow')}>
    <View className="min-h-[92px] rounded-2xl border border-primary/35 bg-primary/8 px-2.5 py-3">
      <Text className="text-2xl">{HOME_UI.quickActions.moreEmoji}</Text>
      <Text className="mt-2 text-xs font-bold text-primary" numberOfLines={1}>
        {HOME_UI.quickActions.moreLabel}
      </Text>
      <Text className="mt-0.5 text-[10px] leading-3.5 text-foreground-secondary" numberOfLines={2}>
        {HOME_UI.quickActions.moreTagline}
      </Text>
    </View>
  </PressableScale>
)

export const HomeQuickActionsCard = () => {
  const exploreBadges = useExploreBadges()
  const missions = useMissionsStore((s) => s.missions)
  const pendingMissions = missions.filter((m) => !m.completed).length

  const actions = getHomeQuickActionsForDisplay()

  const resolveBadge = (action: HomeQuickActionDef): ExploreBadge | { label: string; tone: ExploreBadge['tone'] } => {
    if (action.id === 'quests') {
      return pendingMissions > 0
        ? { label: `${pendingMissions} pendentes`, tone: 'quest' }
        : { label: 'Em dia', tone: 'default' }
    }
    if (action.exploreId) {
      return exploreBadges[action.exploreId]
    }
    return { label: '', tone: 'default' }
  }

  return (
    <GameCard className="gap-3">
      <View>
        <Text className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {HOME_UI.quickActions.title}
        </Text>
        <Text className="mt-1 text-xs text-foreground-secondary">{HOME_UI.quickActions.hint}</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {actions.map((action) => (
          <QuickActionTile key={action.id} action={action} badge={resolveBadge(action)} />
        ))}
        <MoreQuickActionTile />
      </View>
    </GameCard>
  )
}
