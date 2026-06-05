import { Text, View } from 'react-native'

import { Card } from '@/components'
import { useHowItWorksSeen } from '@/hooks'

import { STREAK_SHIELD_MILESTONES } from '../constants'

export const ShieldExplanationCard = () => {
  const { shouldShow } = useHowItWorksSeen('shields')

  if (!shouldShow) return null

  return (
    <Card elevated>
      <Text className="mb-1 text-base font-semibold text-foreground">Como funcionam</Text>
      <Text className="mb-4 text-sm text-foreground-secondary">
        Escudos protegem sua sequência automaticamente quando você perde um dia de estudo.
        Nenhuma ação manual é necessária.
      </Text>
      <View className="gap-2">
        <Text className="text-sm text-foreground">• Cada escudo protege 1 dia de falta</Text>
        <Text className="text-sm text-foreground">• O consumo é automático ao abrir o app</Text>
        <Text className="text-sm text-foreground">• Sem escudos, a sequência é perdida normalmente</Text>
      </View>
      <View className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Conquiste escudos
        </Text>
        {STREAK_SHIELD_MILESTONES.map((milestone) => (
          <Text key={milestone.key} className="text-sm text-foreground-secondary">
            {milestone.label}: +{milestone.shieldsAwarded}{' '}
            {milestone.shieldsAwarded === 1 ? 'escudo' : 'escudos'}
          </Text>
        ))}
      </View>
    </Card>
  )
}
