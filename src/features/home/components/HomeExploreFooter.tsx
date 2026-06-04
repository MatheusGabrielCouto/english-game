import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { GameCard, PressableScale } from '@/components/ui/game';
import { HOME_UI } from '@/features/home/constants/home-ui';

export const HomeExploreFooter = () => (
  <PressableScale
    onPress={() => router.push('/(tabs)/profile' as Href)}
    accessibilityRole="button"
    accessibilityLabel={HOME_UI.explore.cta}
  >
    <GameCard variant="default" className="border-border/80">
      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <View className="min-w-0 flex-1 grow">
          <Text className="text-xs font-bold uppercase tracking-widest text-foreground-secondary">
            {HOME_UI.explore.title}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{HOME_UI.explore.body}</Text>
        </View>
        <Text className="shrink-0 text-sm font-bold text-primary">{HOME_UI.explore.cta} →</Text>
      </View>
    </GameCard>
  </PressableScale>
);
