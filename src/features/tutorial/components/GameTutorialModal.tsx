import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { Button, Modal } from '@/components'
import { cn } from '@/utils'

import {
  GAME_TUTORIAL_MESSAGES,
  GAME_TUTORIAL_STEPS,
} from '../constants/game-tutorial-steps'
import { useGameTutorial } from '../hooks/use-game-tutorial'

export const GameTutorialModal = () => {
  const { height: windowHeight } = useWindowDimensions()
  const maxBodyHeight = Math.min(windowHeight * 0.45, 360)

  const {
    isVisible,
    step,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    handleSkip,
    handleNext,
    handlePrevious,
    handleClose,
  } = useGameTutorial()

  if (!step) return null

  return (
    <Modal
      visible={isVisible}
      onRequestClose={handleSkip}
      chrome={false}
      scrollable={false}
      footerMode="none">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="text-4xl">{step.emoji}</Text>
        <Text className="text-xs font-bold uppercase tracking-widest text-muted">
          {currentStep + 1} / {totalSteps}
        </Text>
      </View>

      <Text className="mt-4 text-xl font-black text-foreground">{step.title}</Text>
      <Text className="mt-2 text-sm leading-relaxed text-foreground-secondary">{step.summary}</Text>

      <ScrollView
        style={{ maxHeight: maxBodyHeight }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View className="mt-4 gap-2">
          {step.bullets.map((bullet) => (
            <View key={bullet} className="flex-row gap-2">
              <Text className="text-sm text-gold">•</Text>
              <Text className="flex-1 text-sm leading-relaxed text-foreground-secondary">
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="mt-5 flex-row justify-center gap-2">
        {GAME_TUTORIAL_STEPS.map((tutorialStep, index) => (
          <View
            key={tutorialStep.id}
            className={cn(
              'h-2 rounded-full',
              index === currentStep ? 'w-6 bg-primary' : 'w-2 bg-border',
            )}
          />
        ))}
      </View>

      <View className="mt-6 gap-3">
        <View className="flex-row gap-3">
          {!isFirstStep ? (
            <View className="flex-1">
              <Button
                label={GAME_TUTORIAL_MESSAGES.previous}
                variant="secondary"
                onPress={handlePrevious}
              />
            </View>
          ) : null}
          <View className="flex-1">
            <Button
              label={isLastStep ? GAME_TUTORIAL_MESSAGES.finish : GAME_TUTORIAL_MESSAGES.next}
              onPress={handleNext}
            />
          </View>
        </View>

        {!isLastStep ? (
          <Button label={GAME_TUTORIAL_MESSAGES.skip} variant="ghost" onPress={handleSkip} />
        ) : (
          <Button label={GAME_TUTORIAL_MESSAGES.finish} variant="ghost" onPress={handleClose} />
        )}
      </View>
    </Modal>
  )
}

export const GameTutorialHost = () => <GameTutorialModal />

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 4,
  },
})
