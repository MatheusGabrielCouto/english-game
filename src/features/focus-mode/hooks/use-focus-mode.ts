import { useCallback, useEffect } from 'react';

import { FocusModeService } from '../services/focus-mode-service';
import { useFocusModeStore } from '../store/focus-mode-store';

export const useFocusMode = () => {
  const settings = useFocusModeStore((s) => s.settings);
  const analytics = useFocusModeStore((s) => s.analytics);
  const activeSession = useFocusModeStore((s) => s.activeSession);
  const liveSession = useFocusModeStore((s) => s.liveSession);
  const lastRewards = useFocusModeStore((s) => s.lastRewards);
  const isLoading = useFocusModeStore((s) => s.isLoading);

  const refresh = useCallback(async () => {
    await FocusModeService.refresh();
  }, []);

  useEffect(() => {
    if (!settings) {
      void FocusModeService.initialize();
    }
  }, [settings]);

  return {
    settings,
    analytics,
    activeSession,
    liveSession,
    lastRewards,
    isLoading,
    refresh,
    startSession: FocusModeService.startSession.bind(FocusModeService),
    completeSession: FocusModeService.completeSession.bind(FocusModeService),
    abandonSession: FocusModeService.abandonSession.bind(FocusModeService),
    updateSettings: FocusModeService.updateSettings.bind(FocusModeService),
    acceptDisclosure: FocusModeService.acceptDisclosure.bind(FocusModeService),
    clearLastRewards: FocusModeService.clearLastRewards.bind(FocusModeService),
  };
};
