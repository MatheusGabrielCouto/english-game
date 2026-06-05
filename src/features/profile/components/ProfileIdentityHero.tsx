import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { XPBar } from '@/components'
import { Avatar } from '@/components/ui/Avatar'
import { GameCard, LevelBadge, PressableScale } from '@/components/ui/game'
import { routes, SHARED_TRANSITION_TAGS } from '@/constants'
import { useAchievementsStore } from '@/features/achievements/store/achievements-store'
import { useAppStore } from '@/features/app/store/app-store'
import type { AvatarBadgeKey, AvatarFrameKey } from '@/features/avatar/constants/avatar-customization'
import { AVATAR_BADGES, AVATAR_FRAMES } from '@/features/avatar/constants/avatar-customization'
import { usePlayerStore, usePlayerXP } from '@/features/player'
import { getRequiredXP } from '@/features/player/utils/xp'
import { formatNumber } from '@/features/statistics/utils/formatters'

import { PROFILE_UI } from '../constants/profile-ui'

type ProfileIdentityHeroProps = {
  onEditName: () => void
}

const computeLifetimeXp = (level: number, currentXp: number): number => {
  let total = currentXp
  for (let lv = 1; lv < level; lv += 1) {
    total += getRequiredXP(lv)
  }
  return total
}

export const ProfileIdentityHero = ({ onEditName }: ProfileIdentityHeroProps) => {
  const name = usePlayerStore((s) => s.name)
  const title = usePlayerStore((s) => s.title)
  const level = usePlayerStore((s) => s.level)
  const xp = usePlayerStore((s) => s.xp)
  const avatarFrame = useAppStore((s) => s.avatarFrame)
  const avatarBadge = useAppStore((s) => s.avatarBadge)
  const achievementSummary = useAchievementsStore((s) => s.summary)
  const { current, required } = usePlayerXP()

  const frame = AVATAR_FRAMES[avatarFrame as AvatarFrameKey]
  const badge = avatarBadge ? AVATAR_BADGES[avatarBadge as AvatarBadgeKey] : null
  const lifetimeXp = computeLifetimeXp(level, xp)

  return (
    <GameCard
      variant="hero"
      glow
      sharedTransitionTag={SHARED_TRANSITION_TAGS.playerHero}
      className="items-center gap-4 py-6">
      <PressableScale onPress={onEditName} accessibilityRole="button" accessibilityLabel={PROFILE_UI.playerEditLabel}>
        <Avatar name={name} size="xl" frameKey={avatarFrame} badgeKey={avatarBadge} ring />
      </PressableScale>

      <View className="items-center gap-1 px-4">
        <Text className="text-center text-2xl font-black text-foreground">{name}</Text>
        <Text className="text-center text-sm font-bold text-gold">{title}</Text>
        {frame ? (
          <Text className="text-center text-xs text-foreground-secondary">
            {PROFILE_UI.frameLabel}: {frame.label}
          </Text>
        ) : null}
        {badge && avatarBadge !== 'none' ? (
          <Text className="text-center text-xs text-primary">
            {PROFILE_UI.badgeLabel}: {badge.emoji} {badge.label}
          </Text>
        ) : null}
      </View>

      <LevelBadge level={level} size="lg" />

      <View className="w-full flex-row flex-wrap justify-center gap-2 px-2">
        <View className="min-w-[100px] flex-1 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
          <Text className="text-[10px] font-semibold uppercase text-muted">{PROFILE_UI.xpLevelLabel}</Text>
          <Text className="text-sm font-black text-primary">
            {current}/{required}
          </Text>
        </View>
        <View className="min-w-[100px] flex-1 rounded-xl border border-xp/30 bg-xp/10 px-3 py-2">
          <Text className="text-[10px] font-semibold uppercase text-muted">{PROFILE_UI.xpTotalLabel}</Text>
          <Text className="text-sm font-black text-xp">{formatNumber(lifetimeXp)}</Text>
        </View>
        <View className="min-w-[100px] flex-1 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2">
          <Text className="text-[10px] font-semibold uppercase text-muted">{PROFILE_UI.achievementsLabel}</Text>
          <Text className="text-sm font-black text-gold">
            {achievementSummary.unlocked}/{achievementSummary.total}
          </Text>
        </View>
      </View>

      <View className="w-full px-2">
        <XPBar showLevel={false} />
      </View>

      <PressableScale
        onPress={() => router.push(routes.titles as Href)}
        accessibilityRole="button"
        accessibilityLabel={PROFILE_UI.changeTitle}>
        <Text className="text-sm font-bold text-primary">{PROFILE_UI.changeTitle} →</Text>
      </PressableScale>
    </GameCard>
  )
}
