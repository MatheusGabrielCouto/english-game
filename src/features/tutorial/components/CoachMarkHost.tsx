import { type Href, router } from 'expo-router'
import { useEffect } from 'react'

import { useAppStore } from '@/features/app/store/app-store'

import { COACH_MARK_STEPS } from '../constants/coach-mark-steps'
import { useCoachMarkStore } from '../store/coach-mark-store'
import { useTutorialStore } from '../store/tutorial-store'
import { CoachMarkOverlay } from './CoachMarkOverlay'

const NAVIGATION_SETTLE_MS = 650
const TOUR_START_DELAY_MS = 400

export const CoachMarkHost = () => {
  const hasHydrated = useAppStore((s) => s._hasHydrated)
  const hasOnboarded = useAppStore((s) => s.hasOnboarded)
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded)
  const wizardCompleted = useTutorialStore((s) => s.wizardCompleted)
  const gameTutorialVisible = useTutorialStore((s) => s.isVisible)

  const isActive = useCoachMarkStore((s) => s.isActive)
  const stepIndex = useCoachMarkStore((s) => s.stepIndex)
  const targets = useCoachMarkStore((s) => s.targets)
  const start = useCoachMarkStore((s) => s.start)
  const next = useCoachMarkStore((s) => s.next)
  const skipCoachMark = useCoachMarkStore((s) => s.skip)
  const finishCoachMark = useCoachMarkStore((s) => s.finish)
  const requestRemeasure = useCoachMarkStore((s) => s.requestRemeasure)

  const step = COACH_MARK_STEPS[stepIndex]
  const totalSteps = COACH_MARK_STEPS.length
  const isLastStep = stepIndex >= totalSteps - 1
  const rect = step ? targets[step.targetKey] : undefined

  useEffect(() => {
    if (!hasHydrated || hasOnboarded || !wizardCompleted || isActive || gameTutorialVisible) {
      return
    }

    const timer = setTimeout(() => {
      start()
    }, TOUR_START_DELAY_MS)

    return () => clearTimeout(timer)
  }, [gameTutorialVisible, hasHydrated, hasOnboarded, isActive, start, wizardCompleted])

  useEffect(() => {
    if (!isActive) return

    const currentStep = COACH_MARK_STEPS[stepIndex]
    if (!currentStep) return

    let cancelled = false
    const run = async () => {
      if (currentStep.route) {
        router.push(currentStep.route as Href)
      }
      await new Promise((resolve) => setTimeout(resolve, NAVIGATION_SETTLE_MS))
      if (!cancelled) {
        requestRemeasure()
      }
      await new Promise((resolve) => setTimeout(resolve, 220))
      if (!cancelled) {
        requestRemeasure()
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [isActive, requestRemeasure, stepIndex])

  const handleComplete = () => {
    setHasOnboarded(true)
    finishCoachMark()
  }

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
      return
    }
    next()
  }

  const handleSkip = () => {
    setHasOnboarded(true)
    skipCoachMark()
  }

  if (!isActive || !step) {
    return null
  }

  return (
    <CoachMarkOverlay
      step={step}
      rect={rect}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      isLastStep={isLastStep}
      onNext={handleNext}
      onSkip={handleSkip}
    />
  )
}
