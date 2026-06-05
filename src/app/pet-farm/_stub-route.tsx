import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

type PetFarmStubRouteProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export const PetFarmStubRoute = ({ title, subtitle, children }: PetFarmStubRouteProps) => (
  <ScreenContainer scrollable>
    <ScreenHeader showBack title={title} subtitle={subtitle} />
    <View className="pt-2">{children}</View>
  </ScreenContainer>
);
