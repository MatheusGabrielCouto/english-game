import { useCallback } from 'react';

import { useAppStore } from '@/features/app/store/app-store';

import { GAME_TUTORIAL_STEPS } from '../constants/game-tutorial-steps';
import { useTutorialStore } from '../store/tutorial-store';

export const useGameTutorial = () => {
  const hasOnboarded = useAppStore((state) => state.hasOnboarded);
  const setHasOnboarded = useAppStore((state) => state.setHasOnboarded);
  const isVisible = useTutorialStore((state) => state.isVisible);
  const currentStep = useTutorialStore((state) => state.currentStep);
  const open = useTutorialStore((state) => state.open);
  const close = useTutorialStore((state) => state.close);
  const next = useTutorialStore((state) => state.next);
  const previous = useTutorialStore((state) => state.previous);

  const totalSteps = GAME_TUTORIAL_STEPS.length;
  const step = GAME_TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleOpen = useCallback(() => {
    open(0);
  }, [open]);

  const handleSkip = useCallback(() => {
    setHasOnboarded(true);
    close();
  }, [close, setHasOnboarded]);

  const handleFinish = useCallback(() => {
    setHasOnboarded(true);
    close();
  }, [close, setHasOnboarded]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleFinish();
      return;
    }
    next(totalSteps);
  }, [handleFinish, isLastStep, next, totalSteps]);

  const handlePrevious = useCallback(() => {
    previous();
  }, [previous]);

  return {
    hasOnboarded,
    isVisible,
    step,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    handleOpen,
    handleSkip,
    handleFinish,
    handleNext,
    handlePrevious,
    handleClose: close,
  };
};

export type UseGameTutorialReturn = ReturnType<typeof useGameTutorial>;
