import { SplashGate } from '@/components/splash';
import { theme } from '@/constants';
import { OnboardingWizardModal } from '@/features/onboarding';
import { PunishmentHost } from '@/features/punishments';
import { CoachMarkHost, GameTutorialHost } from '@/features/tutorial';
import { useAppFonts, useAppHydration, useDeepLinking, useNetworkStatus } from '@/hooks';
import { StartupPerfService } from '@/services/startup-perf-service';
import { finishStartupProgress } from '@/storage/hydration-progress';
import { useStartupHydrationStore } from '@/storage/startup-hydration-store';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { NetworkStatusHost } from './NetworkStatusHost';
import { ToastHost } from './ToastHost';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.foreground,
    border: theme.colors.border,
    notification: theme.colors.accent,
  },
};

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const hydrationDone = useAppHydration();
  const fontsReady = useAppFonts();
  const progress = useStartupHydrationStore((state) => state.progress);
  const isReady = progress >= 100;

  useEffect(() => {
    if (!hydrationDone || !fontsReady) return;
    finishStartupProgress();
  }, [fontsReady, hydrationDone]);

  useEffect(() => {
    if (!isReady) return;
    StartupPerfService.mark('hydration_ready');
  }, [isReady]);

  useDeepLinking(isReady);
  useNetworkStatus();

  return (
    <SplashGate isReady={isReady}>
      <ErrorBoundary>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="light" />
          <NetworkStatusHost />
          {children}
          <OnboardingWizardModal />
          <CoachMarkHost />
          <GameTutorialHost />
          <PunishmentHost />
          <ToastHost />
        </ThemeProvider>
      </ErrorBoundary>
    </SplashGate>
  );
};
