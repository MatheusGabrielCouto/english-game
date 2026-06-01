import { Pressable, Switch, Text, View } from 'react-native'

import { Card } from '@/components'
import { useAudioStore } from '@/services/audio'

export const AudioSettingsSection = () => {
  const enabled = useAudioStore((s) => s.enabled)
  const studySilentMode = useAudioStore((s) => s.studySilentMode)
  const sfxVolume = useAudioStore((s) => s.sfxVolume)
  const patch = useAudioStore((s) => s.patch)

  const handleToggleEnabled = (value: boolean) => {
    void patch({ enabled: value })
  }

  const handleToggleSilentStudy = (value: boolean) => {
    void patch({ studySilentMode: value })
  }

  const handleVolumeStep = (direction: 'up' | 'down') => {
    const step = direction === 'up' ? 0.1 : -0.1
    const next = Math.max(0, Math.min(1, Math.round((sfxVolume + step) * 10) / 10))
    void patch({ sfxVolume: next })
  }

  return (
    <Card elevated className="gap-4">
      <View>
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">🔊 Áudio do jogo</Text>
        <Text className="mt-1 text-sm text-foreground-secondary">
          Sons de feedback, missões e recompensas (MVP)
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">Sons ativados</Text>
        <Switch
          value={enabled}
          onValueChange={handleToggleEnabled}
          accessibilityLabel="Ativar sons do jogo"
        />
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-foreground">Modo estudo silencioso</Text>
          <Text className="mt-0.5 text-xs text-muted">Só marcos importantes (level up, loot, dia de estudo)</Text>
        </View>
        <Switch
          value={studySilentMode}
          onValueChange={handleToggleSilentStudy}
          disabled={!enabled}
          accessibilityLabel="Modo estudo silencioso"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground">
          Volume dos efeitos · {Math.round(sfxVolume * 100)}%
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Diminuir volume dos efeitos"
            onPress={() => handleVolumeStep('down')}
            className="rounded-lg border border-border bg-surface px-4 py-2">
            <Text className="text-sm font-bold text-foreground">−</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aumentar volume dos efeitos"
            onPress={() => handleVolumeStep('up')}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2">
            <Text className="text-center text-sm font-bold text-foreground">+</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  )
}
