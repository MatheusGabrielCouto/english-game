import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { useRoutinesStore } from '@/features/routines/store/routines-store'

export const QuestsRoutinesBanner = () => {
  const pendingToday = useRoutinesStore((s) => s.pendingToday.length)
  const dueToday = useRoutinesStore((s) => s.dueToday.length)

  return (
    <PressableScale
      fill
      onPress={() => router.push(routes.routines as Href)}
      accessibilityRole="button"
      accessibilityLabel="Rotinas de hoje">
      <GameCard className="border-accent/30 bg-accent/5">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-xs font-black uppercase tracking-widest text-accent">📋 Rotinas</Text>
            <Text className="mt-1 text-sm text-foreground-secondary">
              {pendingToday > 0
                ? `${pendingToday} pendente${pendingToday > 1 ? 's' : ''} hoje`
                : dueToday > 0
                  ? `${dueToday} agendada${dueToday > 1 ? 's' : ''}`
                  : 'Configure seus hábitos diários'}
            </Text>
          </View>
          <Text className="shrink-0 text-sm font-bold text-primary">Abrir →</Text>
        </View>
      </GameCard>
    </PressableScale>
  )
}
