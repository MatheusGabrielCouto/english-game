import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { canAccessFlashDeck } from '@/constants';
import { LEARNING_UI } from '@/features/learning';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';

type FlashDeckFeatureGateProps = {
  children: ReactNode;
};

export const FlashDeckFeatureGate = ({ children }: FlashDeckFeatureGateProps) => {
  const enabled = canAccessFlashDeck();

  useEffect(() => {
    if (!enabled) {
      // no-op: show fallback UI
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <ScreenContainer scrollable>
        <ScreenHeader showBack title={FLASH_DECK_UI.screenTitle} emoji={FLASH_DECK_UI.emoji} />
        <View className="gap-4 py-8">
          <Text className="text-center  leading-6 text-foreground-secondary">
            {LEARNING_UI.comingSoon}
          </Text>
          <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  return <>{children}</>;
};
