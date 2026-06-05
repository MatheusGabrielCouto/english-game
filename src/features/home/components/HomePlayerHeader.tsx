import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Avatar } from '@/components/ui/Avatar'
import { GameCard, GameDisplayText, LevelBadge, PressableScale, SharedHeroTransition } from '@/components/ui/game'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { profileHref, SHARED_TRANSITION_TAGS } from '@/constants'
import { useAppStore } from '@/features/app/store/app-store'
import { ActiveBonusesCard } from '@/features/game-design/components/ActiveBonusesCard'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomePlayerResourceTile } from '@/features/home/components/shared/HomePlayerResourceTile'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useHomeDashboard } from '@/features/home/hooks/use-home-dashboard'
import { usePlayerStore } from '@/features/player'
import { formatNumber } from '@/features/statistics/utils/formatters'
import { CoachMarkTarget } from '@/features/tutorial'

export const HomePlayerHeader = () => {
  const name = usePlayerStore((s) => s.name)
  const title = usePlayerStore((s) => s.title)
  const level = usePlayerStore((s) => s.level)
  const coins = usePlayerStore((s) => s.coins)
  const avatarFrame = useAppStore((s) => s.avatarFrame)
  const avatarBadge = useAppStore((s) => s.avatarBadge)
  const { studyPoints, prestigeLevel, prestigeName, xpCurrent, xpRequired } = useHomeDashboard()

  const xpPercent =
    xpRequired > 0 ? Math.min(100, Math.max(0, Math.round((xpCurrent / xpRequired) * 100))) : 0
  const xpRemaining = Math.max(0, xpRequired - xpCurrent)

  const handleOpenProfile = () => {
    router.push(profileHref() as Href)
  }

  const handleEditAvatar = () => {
    router.push(profileHref({ edit: true }) as Href)
  }

  return (
    <GameCard
      variant="hero"
      glow
      sharedTransitionTag={SHARED_TRANSITION_TAGS.playerHero}
      className="overflow-hidden">
      <GameDisplayText variant="label" className="tracking-[0.22em]">
        {HOME_UI.playerHeader.brand}
      </GameDisplayText>

      <HomeCardRow className="mt-4 gap-3">
        <PressableScale
          onPress={handleEditAvatar}
          accessibilityRole="button"
          accessibilityLabel={HOME_UI.playerHeader.editAvatar}>
          <SharedHeroTransition tag={SHARED_TRANSITION_TAGS.profileAvatarHero}>
            <Avatar name={name} size="xl" frameKey={avatarFrame} badgeKey={avatarBadge} ring />
          </SharedHeroTransition>
        </PressableScale>

        <PressableScale
          fill
          onPress={handleOpenProfile}
          accessibilityRole="button"
          accessibilityLabel={HOME_UI.playerHeader.openProfile}
          className={HOME_LAYOUT.growBlock}>
          <GameDisplayText variant="hero" numberOfLines={1}>
            {name}
          </GameDisplayText>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View className="rounded-lg border border-gold/30 bg-gold/15 px-2.5 py-1">
              <Text className="text-xs font-bold text-gold" numberOfLines={1}>
                👑 {title}
              </Text>
            </View>
            <LevelBadge level={level} size="md" />
          </View>
          {prestigeLevel > 0 && prestigeName ? (
            <View className="mt-2 self-start rounded-lg border border-primary/25 bg-primary/10 px-2 py-1">
              <Text className="text-[10px] font-bold uppercase text-primary">
                {HOME_UI.playerHeader.prestigeLabel} · {prestigeName}
              </Text>
            </View>
          ) : null}
          <Text className="mt-2 text-xs font-bold text-primary">
            {HOME_UI.playerHeader.viewProfileHint}
          </Text>
        </PressableScale>
      </HomeCardRow>

      <View className="mt-4 flex-row gap-3">
        <CoachMarkTarget coachKey="home-player-coins" className="flex-1">
          <HomePlayerResourceTile
            emoji="🪙"
            label={HOME_UI.playerHeader.coinsLabel}
            value={formatNumber(coins)}
            tone="gold"
            className="flex-1"
          />
        </CoachMarkTarget>
        <HomePlayerResourceTile
          emoji="📚"
          label={HOME_UI.playerHeader.studyPointsLabel}
          value={formatNumber(studyPoints)}
          suffix={HOME_UI.playerHeader.studyPointsSuffix}
          tone="accent"
          className="flex-1"
        />
      </View>

      <View className="mt-5 rounded-2xl border border-border/80 bg-surface/60 px-3 py-3">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-xs font-bold uppercase text-foreground-secondary">
            {HOME_UI.playerHeader.xpLabel}
          </Text>
          <Text className="shrink text-right text-xs font-black text-accent">
            {HOME_UI.playerHeader.xpProgress(xpCurrent, xpRequired, xpPercent)}
          </Text>
        </View>
        <ProgressBar
          className="mt-2"
          value={xpCurrent}
          max={xpRequired}
          accessibilityLabel={`Experiência: ${xpCurrent} de ${xpRequired}`}
        />
        <Text className="mt-2 text-[11px] text-foreground-secondary">
          {HOME_UI.playerHeader.xpRemaining(xpRemaining)}
        </Text>
      </View>

      <View className="mt-4">
        <ActiveBonusesCard />
      </View>
    </GameCard>
  )
}
