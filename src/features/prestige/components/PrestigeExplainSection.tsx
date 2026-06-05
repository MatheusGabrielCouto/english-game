import { Text, View } from 'react-native';

import { Card } from '@/components';
import { GameCard } from '@/components/ui/game';
import { useHowItWorksSeen } from '@/hooks';

import { PRESTIGE_UI } from '../constants/prestige-ui';

export const PrestigeWhatIsSection = () => (
  <Card elevated className="gap-3">
    <Text className="text-xs font-bold uppercase tracking-widest text-primary">
      {PRESTIGE_UI.whatIsTitle}
    </Text>
    {PRESTIGE_UI.whatIsBody.map((paragraph) => (
      <Text key={paragraph.slice(0, 24)} className="text-sm leading-6 text-foreground-secondary">
        {paragraph}
      </Text>
    ))}
  </Card>
);

export const PrestigeHowItWorksSection = () => {
  const { shouldShow } = useHowItWorksSeen('prestige');

  if (!shouldShow) return null;

  return (
  <Card elevated className="gap-4">
    <Text className="text-xs font-bold uppercase tracking-widest text-muted">
      {PRESTIGE_UI.howItWorksTitle}
    </Text>
    {PRESTIGE_UI.howItWorksSteps.map((item) => (
      <View key={item.step} className="flex-row gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
          <Text className="text-sm font-black text-primary">{item.step}</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-foreground">{item.title}</Text>
          <Text className="mt-0.5 text-xs leading-5 text-foreground-secondary">{item.detail}</Text>
        </View>
      </View>
    ))}
  </Card>
  );
};

export const PrestigeKeepsAndGainsSection = () => (
  <GameCard variant="default" className="gap-4">
    <View className="flex-row gap-4">
      <View className="flex-1 gap-2">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-success">
          {PRESTIGE_UI.keepsTitle}
        </Text>
        {PRESTIGE_UI.keepsItems.map((item) => (
          <Text key={item} className="text-xs leading-5 text-foreground-secondary">
            ✓ {item}
          </Text>
        ))}
      </View>
      <View className="flex-1 gap-2">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-gold">
          {PRESTIGE_UI.gainsTitle}
        </Text>
        {PRESTIGE_UI.gainsItems.map((item) => (
          <Text key={item} className="text-xs leading-5 text-foreground-secondary">
            ✦ {item}
          </Text>
        ))}
      </View>
    </View>
  </GameCard>
);
