import { useEffect } from 'react'

import {
  PET_FARM_ONBOARDING_STEPS,
} from '../constants/pet-farm-onboarding-ui'
import { usePetFarmOnboardingStore } from '../store/pet-farm-onboarding-store'
import { PetFarmOnboardingOverlay } from './PetFarmOnboardingOverlay'

const REMEASURE_SETTLE_MS = 320

type PetFarmOnboardingHostProps = {
  onComplete: () => void
}

export const PetFarmOnboardingHost = ({ onComplete }: PetFarmOnboardingHostProps) => {
  const isActive = usePetFarmOnboardingStore((s) => s.isActive)
  const stepIndex = usePetFarmOnboardingStore((s) => s.stepIndex)
  const targets = usePetFarmOnboardingStore((s) => s.targets)
  const next = usePetFarmOnboardingStore((s) => s.next)
  const skip = usePetFarmOnboardingStore((s) => s.skip)
  const finish = usePetFarmOnboardingStore((s) => s.finish)
  const requestRemeasure = usePetFarmOnboardingStore((s) => s.requestRemeasure)

  const step = PET_FARM_ONBOARDING_STEPS[stepIndex]
  const totalSteps = PET_FARM_ONBOARDING_STEPS.length
  const isLastStep = stepIndex >= totalSteps - 1
  const rect = step ? targets[step.targetKey] : undefined

  useEffect(() => {
    if (!isActive || !step) return

    const timer = setTimeout(() => {
      requestRemeasure()
    }, REMEASURE_SETTLE_MS)

    return () => clearTimeout(timer)
  }, [isActive, requestRemeasure, step, stepIndex])

  const handleComplete = () => {
    onComplete()
    finish()
  }

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
      return
    }
    next()
  }

  const handleSkip = () => {
    onComplete()
    skip()
  }

  if (!isActive || !step) {
    return null
  }

  return (
    <PetFarmOnboardingOverlay
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
