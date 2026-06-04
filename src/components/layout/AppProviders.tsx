import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { theme } from '@/constants';
import { OnboardingWizardModal } from '@/features/onboarding';
import { PunishmentHost } from '@/features/punishments';
import { GameTutorialHost } from '@/features/tutorial';
import { useAppHydration } from '@/hooks';
import { SplashGate } from '@/components/splash';

import { ErrorBoundary } from './ErrorBoundary';
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
  const isReady = useAppHydration();

  return (
    <SplashGate isReady={isReady}>
      <ErrorBoundary>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="light" />
          {children}
          <OnboardingWizardModal />
          <GameTutorialHost />
          <PunishmentHost />
          <ToastHost />
        </ThemeProvider>
      </ErrorBoundary>
    </SplashGate>
  );
};
