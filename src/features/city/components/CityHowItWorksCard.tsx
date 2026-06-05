import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { useHowItWorksSeen } from '@/hooks';

import { CITY_UI } from '../constants/city-ui';

export const CityHowItWorksCard = () => {
  const { shouldShow } = useHowItWorksSeen('city');

  if (!shouldShow) return null;

  return (
  <GameCard variant="quest">
    <Text className="text-xs font-bold uppercase tracking-widest text-accent">
      💡 {CITY_UI.howItWorksTitle}
    </Text>
    <View className="mt-3 gap-2">
      {CITY_UI.howItWorksSteps.map((step, index) => (
        <View key={step} className="flex-row gap-2">
          <View className="h-5 w-5 items-center justify-center rounded-full bg-accent/20">
            <Text className="text-[10px] font-black text-accent">{index + 1}</Text>
          </View>
          <Text className="flex-1 text-sm leading-5 text-foreground-secondary">{step}</Text>
        </View>
      ))}
    </View>
  </GameCard>
  );
};
