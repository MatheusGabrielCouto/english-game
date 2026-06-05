import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Modal } from '@/components'
import { INPUT_PLACEHOLDER_COLOR } from '@/constants'
import { useAppStore } from '@/features/app/store/app-store'
import {
    DIFFICULTY_CONFIG,
    DIFFICULTY_ORDER,
    type LearningDifficultyValue,
} from '@/features/game-design/constants/difficulty'
import { usePlayerStore } from '@/features/player'
import { useTutorialStore } from '@/features/tutorial/store/tutorial-store'
import { cn, playerNameSchema } from '@/utils'
import { haptics } from '@/utils/haptics'

export const OnboardingWizardModal = () => {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded)
  const hasHydrated = useAppStore((s) => s._hasHydrated)
  const difficulty = useAppStore((s) => s.difficulty)
  const setDifficulty = useAppStore((s) => s.setDifficulty)
  const playerName = usePlayerStore((s) => s.name)
  const setName = usePlayerStore((s) => s.setName)
  const wizardCompleted = useTutorialStore((s) => s.wizardCompleted)
  const completeWizard = useTutorialStore((s) => s.completeWizard)
  const openTutorial = useTutorialStore((s) => s.open)

  const [name, setNameInput] = useState(playerName)
  const [selectedDifficulty, setSelectedDifficulty] = useState<LearningDifficultyValue>(difficulty)
  const [error, setError] = useState<string | null>(null)

  const visible = hasHydrated && !hasOnboarded && !wizardCompleted

  const handleContinue = () => {
    const parsed = playerNameSchema.safeParse({ name: name.trim() })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Nome inválido')
      haptics.warning()
      return
    }

    setError(null)
    setName(parsed.data.name)
    setDifficulty(selectedDifficulty)
    completeWizard()
    haptics.success()
    openTutorial(0)
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={handleContinue}
      title="Bem-vindo ao English Quest"
      description="Crie sua identidade de herói em menos de 1 minuto."
      confirmLabel="Começar jornada"
      cancelLabel="Usar padrão"
      onConfirm={handleContinue}
      onCancel={handleContinue}>
      <View className="gap-5">
        <View>
          <Text className="mb-2 text-sm font-semibold text-foreground">Como você quer ser chamado?</Text>
          <TextInput
            className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground"
            placeholder="Seu nome de herói"
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            value={name}
            onChangeText={(value) => {
              setNameInput(value)
              if (error) setError(null)
            }}
            autoCapitalize="words"
            accessibilityLabel="Nome do jogador"
          />
          {error ? <Text className="mt-2 text-sm text-danger">{error}</Text> : null}
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-foreground">Ritmo de aprendizado</Text>
          <View className="gap-2">
            {DIFFICULTY_ORDER.map((option) => {
              const config = DIFFICULTY_CONFIG[option]
              const isActive = selectedDifficulty === option

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => {
                    haptics.tap()
                    setSelectedDifficulty(option)
                  }}
                  className={cn(
                    'rounded-xl border px-4 py-3',
                    isActive ? 'border-primary bg-primary/15' : 'border-border bg-surface',
                  )}>
                  <Text className={cn('font-semibold', isActive ? 'text-primary' : 'text-foreground')}>
                    {config.label}
                  </Text>
                  <Text className="mt-1 text-xs text-foreground-secondary">{config.description}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>
    </Modal>
  )
}
