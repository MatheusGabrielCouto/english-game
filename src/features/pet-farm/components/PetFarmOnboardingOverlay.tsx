import { useEffect } from 'react'
import { Modal, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { Button } from '@/components'

import {
  PET_FARM_ONBOARDING_UI,
  type PetFarmOnboardingStep,
} from '../constants/pet-farm-onboarding-ui'
import type { PetFarmOnboardingTargetRect } from '../store/pet-farm-onboarding-store'

const HOLE_PADDING = 10

type PetFarmOnboardingOverlayProps = {
  step: PetFarmOnboardingStep
  rect: PetFarmOnboardingTargetRect | undefined
  stepIndex: number
  totalSteps: number
  isLastStep: boolean
  onNext: () => void
  onSkip: () => void
}

export const PetFarmOnboardingOverlay = ({
  step,
  rect,
  stepIndex,
  totalSteps,
  isLastStep,
  onNext,
  onSkip,
}: PetFarmOnboardingOverlayProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const pulse = useSharedValue(1)

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
  }, [pulse, step.id])

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))

  const hole = rect
    ? {
        x: Math.max(0, rect.x - HOLE_PADDING),
        y: Math.max(0, rect.y - HOLE_PADDING),
        width: Math.min(screenWidth, rect.width + HOLE_PADDING * 2),
        height: rect.height + HOLE_PADDING * 2,
      }
    : null

  const tooltipOnTop = step.placement === 'top' && hole

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onSkip}>
      <View className="flex-1" accessibilityViewIsModal>
        {hole ? (
          <>
            <View style={[styles.scrim, { top: 0, left: 0, right: 0, height: hole.y }]} />
            <View
              style={[styles.scrim, { top: hole.y, left: 0, width: hole.x, height: hole.height }]}
            />
            <View
              style={[
                styles.scrim,
                {
                  top: hole.y,
                  left: hole.x + hole.width,
                  right: 0,
                  height: hole.height,
                },
              ]}
            />
            <View
              style={[
                styles.scrim,
                {
                  top: hole.y + hole.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ring,
                {
                  top: hole.y,
                  left: hole.x,
                  width: hole.width,
                  height: hole.height,
                },
                ringStyle,
              ]}
            />
          </>
        ) : (
          <View style={[styles.scrim, StyleSheet.absoluteFill]} />
        )}

        <View
          className="absolute left-4 right-4 rounded-2xl border border-emerald-500/40 bg-surface p-5"
          style={
            tooltipOnTop
              ? { bottom: screenHeight - (hole?.y ?? 0) + 12 }
              : { bottom: 28 }
          }>
          <View className="flex-row items-start justify-between gap-3">
            <Text className="text-3xl">{step.emoji}</Text>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">
              {stepIndex + 1} / {totalSteps}
            </Text>
          </View>
          <Text className="mt-3 text-lg font-black text-foreground">{step.title}</Text>
          <Text className="mt-2 text-sm leading-relaxed text-foreground-secondary">{step.body}</Text>
          {!hole ? (
            <Text className="mt-2 text-xs text-muted">{PET_FARM_ONBOARDING_UI.waiting}</Text>
          ) : null}

          <View className="mt-5 gap-3">
            <Button
              label={isLastStep ? PET_FARM_ONBOARDING_UI.finish : PET_FARM_ONBOARDING_UI.next}
              onPress={onNext}
              disabled={!hole}
            />
            <Button
              label={PET_FARM_ONBOARDING_UI.skip}
              variant="ghost"
              onPress={onSkip}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  ring: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: 'rgba(52, 211, 153, 0.95)',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 10,
  },
})
