import { memo } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { AppIcon } from '@/components/ui/AppIcon'
import { PressableScale } from '@/components/ui/game'
import { theme } from '@/constants'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/features/game-design/constants/mission-types'
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES } from '@/features/quests/constants/mission-ui'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import type { Mission } from '@/types/mission'
import { cn } from '@/utils'
import { haptics } from '@/utils/haptics'

type MissionCardProps = {
  mission: Mission
  onComplete: (id: string) => void
}

export const MissionCard = memo(({ mission, onComplete }: MissionCardProps) => {
  const completingMissionId = useMissionsStore((state) => state.completingMissionId)
  const isCompleting = completingMissionId === mission.id

  const handlePress = () => {
    if (mission.completed || isCompleting) return
    haptics.medium()
    onComplete(mission.id)
  }

  const categoryKey = mission.category as keyof typeof CATEGORY_LABELS | undefined
  const categoryIcon = categoryKey ? CATEGORY_ICONS[categoryKey] : '🎯'
  const categoryLabel = categoryKey ? CATEGORY_LABELS[categoryKey] : null
  const difficultyKey = mission.difficulty ?? ''
  const difficultyLabel = DIFFICULTY_LABELS[difficultyKey]
  const difficultyStyle = DIFFICULTY_STYLES[difficultyKey] ?? 'border-border bg-surface text-muted'

  return (
    <PressableScale
      fill
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
        isCompleting && 'opacity-90',
      )}
      style={
        !mission.completed && !isCompleting
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
        <View className={cn('h-1 w-full', isCompleting ? 'bg-primary/40' : 'bg-primary/80')} />
      ) : (
        <View className="h-1 w-full bg-success/70" />
      )}

      <View className="gap-3 p-4">
        <View className="flex-row items-start gap-3">
          <View
            className={cn(
              'h-11 w-11 items-center justify-center rounded-2xl border',
              mission.completed ? 'border-success/40 bg-success/15' : 'border-primary/30 bg-primary/10',
            )}>
            <Text className="text-xl">{mission.completed ? '✅' : categoryIcon}</Text>
          </View>

          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              {categoryLabel ? (
                <View className="rounded-md bg-primary/10 px-2 py-0.5">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-primary">
                    {categoryLabel}
                  </Text>
                </View>
              ) : null}
              {difficultyLabel ? (
                <View className={cn('rounded-md border px-2 py-0.5', difficultyStyle)}>
                  <Text className="text-[10px] font-bold uppercase">{difficultyLabel}</Text>
                </View>
              ) : null}
              {mission.completed ? (
                <View className="rounded-md bg-success/15 px-2 py-0.5">
                  <Text className="text-[10px] font-bold uppercase text-success">Concluída</Text>
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
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-1 rounded-lg bg-xp/15 px-2.5 py-1.5">
              <AppIcon name="flash" size={14} color={theme.colors.xp} />
              <Text className="text-xs font-black text-xp">+{mission.xpReward} XP</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-lg bg-coin/15 px-2.5 py-1.5">
              <AppIcon name="logo-bitcoin" size={14} color={theme.colors.coin} />
              <Text className="text-xs font-black text-coin">+{mission.coinReward}</Text>
            </View>
          </View>

          {isCompleting ? (
            <View className="flex-row items-center gap-2 rounded-xl bg-primary/15 px-3 py-2">
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text className="text-xs font-bold text-primary">Salvando…</Text>
            </View>
          ) : !mission.completed ? (
            <View className="rounded-xl bg-primary px-3 py-2">
              <Text className="text-xs font-bold text-foreground">Completar</Text>
            </View>
          ) : (
            <Text className="text-xs font-semibold text-success">+{mission.xpReward} XP recebido</Text>
          )}
        </View>
      </View>
    </PressableScale>
  )
})
