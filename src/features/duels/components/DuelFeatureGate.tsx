import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { canAccessDuels } from '@/constants';
import { LEARNING_UI } from '@/features/learning';

import { DUEL_UI } from '../constants/duel-ui';

type DuelFeatureGateProps = {
  children: ReactNode;
};

export const DuelFeatureGate = ({ children }: DuelFeatureGateProps) => {
  const enabled = canAccessDuels();

  if (!enabled) {
    return (
      <ScreenContainer scrollable>
        <ScreenHeader showBack title={DUEL_UI.screenTitle} emoji={DUEL_UI.emoji} />
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
