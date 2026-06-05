import { useCallback, useEffect, useRef } from 'react';
import {
    Dimensions,
    FlatList,
    type ListRenderItem,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Text,
    View,
} from 'react-native';

import { PressableScale } from '@/components/ui/game';
import type { PetSpeciesDefinition } from '@/features/game-design/catalogs/pet-species-catalog';
import type { PetRarityValue } from '@/types/pet';
import { cn } from '@/utils';

import {
    PET_RARITY_CHIP_STYLES,
    PET_RARITY_LABELS,
} from '../constants/pet-encyclopedia-ui';
import { PetFarmEmptyState } from './PetFarmUiKit';
import { PetSpeciesIcon } from './PetSpeciesIcon';

const CARD_WIDTH = 108;
const CARD_GAP = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

type PetEncyclopediaSpeciesCarouselProps = {
  species: PetSpeciesDefinition[];
  selectedKey: string;
  onSelect: (key: string) => void;
  emptyLabel: string;
};

export const PetEncyclopediaSpeciesCarousel = ({
  species,
  selectedKey,
  onSelect,
  emptyLabel,
}: PetEncyclopediaSpeciesCarouselProps) => {
  const listRef = useRef<FlatList<PetSpeciesDefinition>>(null);
  const screenWidth = Dimensions.get('window').width;
  const sidePadding = Math.max(16, (screenWidth - CARD_WIDTH) / 2 - 20);

  const scrollToKey = useCallback(
    (key: string, animated = true) => {
      const index = species.findIndex((s) => s.key === key);
      if (index < 0) return;
      listRef.current?.scrollToOffset({
        offset: index * SNAP_INTERVAL,
        animated,
      });
    },
    [species],
  );

  useEffect(() => {
    scrollToKey(selectedKey, false);
  }, [selectedKey, scrollToKey]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    const item = species[index];
    if (item && item.key !== selectedKey) {
      onSelect(item.key);
    }
  };

  const renderItem: ListRenderItem<PetSpeciesDefinition> = useCallback(
    ({ item }) => {
      const selected = item.key === selectedKey;
      const styles = PET_RARITY_CHIP_STYLES[item.rarity];

      return (
        <View style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}>
          <PressableScale
            onPress={() => onSelect(item.key)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityState={{ selected }}
            className={cn(
              'items-center rounded-2xl border-2 bg-surface px-2 py-3.5',
              selected ? 'border-primary' : styles.border,
            )}
            style={selected ? { backgroundColor: 'rgba(139, 92, 246, 0.14)' } : undefined}>
            <PetSpeciesIcon speciesKey={item.key} size={selected ? 52 : 42} />
            <Text
              className="mt-2 text-center text-[10px] font-bold text-foreground"
              numberOfLines={2}>
              {item.name}
            </Text>
            <Text className={cn('mt-0.5 text-[8px] capitalize', styles.text)}>
              {PET_RARITY_LABELS[item.rarity as PetRarityValue]}
            </Text>
          </PressableScale>
        </View>
      );
    },
    [onSelect, selectedKey],
  );

  if (species.length === 0) {
    return <PetFarmEmptyState emoji="🔍" title={emptyLabel} />;
  }

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={species}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      snapToInterval={SNAP_INTERVAL}
      decelerationRate="fast"
      disableIntervalMomentum
      onMomentumScrollEnd={handleScrollEnd}
      contentContainerStyle={{
        paddingHorizontal: sidePadding,
        paddingVertical: 10,
      }}
      getItemLayout={(_, index) => ({
        length: SNAP_INTERVAL,
        offset: SNAP_INTERVAL * index,
        index,
      })}
    />
  );
};
