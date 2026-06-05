import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { routes } from '@/constants/routes';

import { useLootBoxes } from '../hooks/use-loot-boxes';
import { LootBoxHistoryList } from './LootBoxHistoryList';
import { LootBoxList } from './LootBoxList';
import { LootBoxOpeningOverlay } from './LootBoxOpeningOverlay';
import { LootBoxRevealModal } from './LootBoxRevealModal';
import { LootBoxStatsCard } from './LootBoxStatsCard';

export const LootBoxScreenContent = () => {
  const {
    boxes,
    history,
    analytics,
    isLoading,
    isOpening,
    selectedBoxId,
    openingBox,
    lastResult,
    openBox,
    finalizeBoxOpen,
    clearLastResult,
  } = useLootBoxes();

  if (isLoading || !analytics) {
    return <ScreenSkeleton variant="hero-list" listCount={3} />;
  }

  return (
    <View className="gap-4">
      <Button
        label="📋 Ver catálogo de recompensas"
        variant="secondary"
        onPress={() => router.push(routes.lootBoxCatalog as Href)}
      />
      <LootBoxStatsCard analytics={analytics} availableCount={boxes.length} />
      <LootBoxList
        boxes={boxes}
        isOpening={isOpening}
        selectedBoxId={selectedBoxId}
        onOpen={(id) => {
          void openBox(id);
        }}
      />
      <LootBoxHistoryList history={history} />
      {openingBox ? (
        <LootBoxOpeningOverlay
          visible
          rarity={openingBox.rarity}
          onFinished={() => {
            void finalizeBoxOpen();
          }}
        />
      ) : null}
      <LootBoxRevealModal result={lastResult} onClose={clearLastResult} />
    </View>
  );
};
