import { Pressable, Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { CollectionBookCategorySummary } from '@/features/collection-book/store/collection-book-store';
import type { CollectibleCategoryValue } from '@/types/collectible';
import { cn } from '@/utils';

import { CATEGORY_SUBTITLES } from '../constants/collection-book-ui';

type CollectionBookCategoryPickerProps = {
  categories: CollectionBookCategorySummary[];
  selected: CollectibleCategoryValue;
  onSelect: (key: CollectibleCategoryValue) => void;
};

export const CollectionBookCategoryPicker = ({
  categories,
  selected,
  onSelect,
}: CollectionBookCategoryPickerProps) => (
  <GameCard variant="default" className="gap-3 p-4">
    <Text className="text-xs font-bold uppercase tracking-wide text-muted">Categorias</Text>
    <View className="gap-2">
      {categories.map((category) => {
        const isSelected = selected === category.key;

        return (
          <Pressable
            key={category.key}
            onPress={() => onSelect(category.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${category.label}, ${category.discovered} de ${category.total}`}
            className={cn(
              'flex-row items-center gap-3 rounded-xl border px-3 py-3',
              isSelected ? 'border-primary/40 bg-primary/10' : 'border-border bg-surface',
            )}>
            <Text className="text-xl">{category.emoji}</Text>
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-bold text-foreground">{category.label}</Text>
              <Text className="text-xs text-muted" numberOfLines={2}>
                {CATEGORY_SUBTITLES[category.key]}
              </Text>
            </View>
            <View className="shrink-0 items-end">
              <Text className="text-sm font-black text-primary">
                {category.discovered}/{category.total}
              </Text>
              <Text className="text-[10px] text-muted">{category.percentage}%</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  </GameCard>
);
