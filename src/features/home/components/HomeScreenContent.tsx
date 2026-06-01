import { type Href, router } from 'expo-router';
import { Platform, Text, useWindowDimensions, View } from 'react-native';

import { GameCard, PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { CareerPreviewCard } from '@/features/career/components/CareerPreviewCard';
import { FarmPreviewCard } from '@/features/farm/components/FarmPreviewCard';
import { HomeHeroHub } from '@/features/home/components/HomeHeroHub';
import { HomeScreenSkeleton } from '@/features/home/components/HomeScreenSkeleton';
import { useHomeScreenReady } from '@/features/home/hooks/use-home-screen-ready';
import { MetagamePreviewCard } from '@/features/metagame/components/MetagamePreviewCard';
import { CoreLoopCard } from '@/features/retention/components/CoreLoopCard';
import { WeeklySummaryCard } from '@/features/weekly-quests';

const QUICK_ACTIONS = [
  ...(Platform.OS === 'android'
    ? [{ label: 'Focus', emoji: '🎯', route: routes.focusMode as Href, tone: 'border-accent/30 bg-accent/10' }]
    : []),
  { label: 'Missões', emoji: '⚔️', route: routes.tabs.quests as Href, tone: 'border-primary/30 bg-primary/10' },
  { label: 'Loja', emoji: '🛒', route: routes.tabs.shop as Href, tone: 'border-accent/30 bg-accent/10' },
  { label: 'Itens', emoji: '🎒', route: routes.tabs.inventory as Href, tone: 'border-gold/30 bg-gold/10' },
  { label: 'Conquistas', emoji: '🏆', route: routes.achievements as Href, tone: 'border-success/30 bg-success/10' },
  { label: 'Carreira', emoji: '💼', route: routes.career as Href, tone: 'border-accent/30 bg-accent/10' },
  { label: 'Farm', emoji: '🌾', route: routes.farm as Href, tone: 'border-success/30 bg-success/10' },
  { label: 'Coleção', emoji: '📖', route: routes.collectionBook as Href, tone: 'border-gold/30 bg-gold/10' },
] as const;

export const HomeScreenContent = () => {
  const isReady = useHomeScreenReady();
  const { width } = useWindowDimensions();
  const quickActionColumns = width >= 420 ? 4 : 3;
  const quickActionWidth = quickActionColumns === 4 ? '23.5%' : '31.5%';

  if (!isReady) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View className="gap-5">
      <HomeHeroHub />
      <CoreLoopCard />
      <CareerPreviewCard />
      <FarmPreviewCard />
      <MetagamePreviewCard />

      <GameCard variant="quest">
        <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Acesso rápido</Text>
        <View className="flex-row flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <PressableScale
              key={action.label}
              onPress={() => router.push(action.route)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              className={`min-h-[74px] rounded-xl border px-2 py-2 ${action.tone}`}
              style={{ width: quickActionWidth }}>
              <Text className="text-center text-lg leading-5">{action.emoji}</Text>
              <Text
                numberOfLines={2}
                className="mt-1 text-center text-xs font-bold leading-4 text-foreground"
              >
                {action.label}
              </Text>
            </PressableScale>
          ))}
        </View>
      </GameCard>

      <WeeklySummaryCard />
    </View>
  );
};
