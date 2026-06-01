import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { theme } from '@/constants';
import { OnboardingWizardModal } from '@/features/onboarding';
import { PunishmentHost } from '@/features/punishments';
import { GameTutorialHost } from '@/features/tutorial';
import { useAppHydration } from '@/hooks';

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

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
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
  );
};
