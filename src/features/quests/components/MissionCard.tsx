import { memo, useEffect, useRef } from 'react'
import { Text, View } from 'react-native'
import { AppIcon } from '@/components/ui/AppIcon'
import { PressableScale } from '@/components/ui/game'
import { CARD_METADATA_TEXT_CLASS, theme } from '@/constants'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/features/game-design/constants/mission-types'
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES } from '@/features/quests/constants/mission-ui'
import type { Mission } from '@/types/mission'
import { cn, haptics } from '@/utils'

import { MissionCoinFloat } from './MissionCoinFloat'
import { MissionIconMorph } from './MissionIconMorph'

type MissionCardProps = {
  mission: Mission
  onComplete: (id: string) => void
  isCompleting?: boolean
}

export const MissionCard = memo(({ mission, onComplete, isCompleting = false }: MissionCardProps) => {
  const morphPlayedRef = useRef(false)

  const handlePress = () => {
    if (mission.completed || isCompleting) return
    onComplete(mission.id)
  }

  useEffect(() => {
    if (!mission.completed) {
      morphPlayedRef.current = false
      return
    }

    if (morphPlayedRef.current) return
    morphPlayedRef.current = true
    haptics.success()
  }, [mission.completed])

  const categoryKey = mission.category as keyof typeof CATEGORY_LABELS | undefined
  const categoryIcon = categoryKey ? CATEGORY_ICONS[categoryKey] : '🎯'
  const categoryLabel = categoryKey ? CATEGORY_LABELS[categoryKey] : null
  const difficultyKey = mission.difficulty ?? ''
  const difficultyLabel = DIFFICULTY_LABELS[difficultyKey]
  const difficultyStyle = DIFFICULTY_STYLES[difficultyKey] ?? 'border-border bg-surface text-muted'
  const showCoinFloat = mission.completed && mission.coinReward > 0

  return (
    <PressableScale
      fill
      haptic="confirm"
      onPress={handlePress}
      disabled={mission.completed || isCompleting}
      accessibilityRole="button"
      accessibilityLabel={`${mission.title}. ${mission.completed ? 'Concluída' : isCompleting ? 'Concluindo' : 'Toque para concluir'}`}
      accessibilityState={{ disabled: mission.completed || isCompleting }}
      className={cn(
        'overflow-hidden rounded-game border',
        mission.completed
          ? 'border-success/40 bg-success/5'
          : 'border-primary/25 bg-surface-elevated active:border-primary/50',
      )}
      style={
        !mission.completed
          ? {
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.14,
              shadowRadius: 10,
              elevation: 4,
            }
          : undefined
      }>
      {!mission.completed ? (
        <View className="h-1 w-full bg-primary/80" />
      ) : (
        <View className="h-1 w-full bg-success/70" />
      )}

      <View className="gap-3 p-4">
          <View className="flex-row items-start gap-3">
            <MissionIconMorph categoryIcon={categoryIcon} completed={mission.completed} />

            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                {categoryLabel ? (
                  <View className="rounded-md bg-primary/10 px-2 py-0.5">
                    <Text className={cn(CARD_METADATA_TEXT_CLASS, 'text-primary')}>
                      {categoryLabel}
                    </Text>
                  </View>
                ) : null}
                {difficultyLabel ? (
                  <View className={cn('rounded-md border px-2 py-0.5', difficultyStyle)}>
                    <Text className={CARD_METADATA_TEXT_CLASS}>{difficultyLabel}</Text>
                  </View>
                ) : null}
                {mission.completed ? (
                  <View className="rounded-md bg-success/15 px-2 py-0.5">
                    <Text className={cn(CARD_METADATA_TEXT_CLASS, 'text-success')}>Concluída</Text>
                  </View>
                ) : null}
              </View>

              <Text
                className={cn(
                  'mt-1.5 text-base font-bold leading-snug text-foreground',
                  mission.completed && 'text-foreground-secondary line-through',
                )}>
                {mission.title}
              </Text>
              <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">
                {mission.description}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between gap-3 border-t border-border/60 pt-3">
            <View className="relative flex-row flex-wrap gap-2">
              <View className="flex-row items-center gap-1 rounded-lg bg-xp/15 px-2.5 py-1.5">
                <AppIcon name="flash" size={14} color={theme.colors.xp} />
                <Text className="text-xs font-black text-xp">+{mission.xpReward} XP</Text>
              </View>
              <View className="relative overflow-visible">
                <View className="flex-row items-center gap-1 rounded-lg bg-coin/15 px-2.5 py-1.5">
                  <AppIcon name="logo-bitcoin" size={14} color={theme.colors.coin} />
                  <Text className="text-xs font-black text-coin">+{mission.coinReward}</Text>
                </View>
                <MissionCoinFloat active={showCoinFloat} />
              </View>
            </View>

            {!mission.completed ? (
              <View className="rounded-xl bg-primary px-3 py-2">
                <Text className="text-xs font-bold text-foreground">Completar</Text>
              </View>
            ) : (
              <Text className="text-xs font-semibold text-success">
                +{mission.xpReward} XP · +{mission.coinReward} 🪙
              </Text>
            )}
          </View>
        </View>
    </PressableScale>
  )
}, (prev, next) =>
  prev.mission.id === next.mission.id &&
  prev.mission.completed === next.mission.completed &&
  prev.mission.title === next.mission.title &&
  prev.isCompleting === next.isCompleting &&
  prev.onComplete === next.onComplete)
