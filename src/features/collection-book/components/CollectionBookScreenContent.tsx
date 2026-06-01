import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { buildCollectionRates } from '@/features/loot-boxes/utils/collection-rates';
import { WishlistSection } from '@/features/wishlist/components/WishlistSection';
import type { CollectibleCategoryValue } from '@/types/collectible';

import { COLLECTION_BOOK_UI } from '../constants/collection-book-ui';
import { CollectionBookService } from '../services/collection-book-service';
import { useCollectionBookStore } from '../store/collection-book-store';
import { CollectionBookCategoryPicker } from './CollectionBookCategoryPicker';
import { CollectionBookHeroCard } from './CollectionBookHeroCard';
import { CollectionBookHowItWorksCard } from './CollectionBookHowItWorksCard';
import { CollectionBookItemRow } from './CollectionBookItemRow';
import { CollectionBookRatesCard } from './CollectionBookRatesCard';

export const CollectionBookScreenContent = () => {
  const categories = useCollectionBookStore((s) => s.categories);
  const entries = useCollectionBookStore((s) => s.entries);
  const overallPercentage = useCollectionBookStore((s) => s.overallPercentage);
  const [selectedCategory, setSelectedCategory] = useState<CollectibleCategoryValue>('relic');

  const discoveredSet = useMemo(() => new Set(entries.map((entry) => entry.itemKey)), [entries]);
  const collectionRates = useMemo(() => buildCollectionRates(discoveredSet), [discoveredSet]);
  const catalog = CollectionBookService.getCatalogForCategory(selectedCategory);
  const activeCategory = categories.find((c) => c.key === selectedCategory);

  return (
    <View className="gap-4 pb-4">
      <WishlistSection />
      <CollectionBookHeroCard
        overallPercentage={overallPercentage}
        discoveredCount={entries.length}
      />
      <CollectionBookHowItWorksCard />
      <CollectionBookRatesCard rates={collectionRates} />
      <CollectionBookCategoryPicker
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <View className="gap-2">
        <View className="gap-1 px-1">
          <Text className="text-sm font-black text-foreground">
            {COLLECTION_BOOK_UI.albumTitle}
            {activeCategory ? ` · ${activeCategory.emoji} ${activeCategory.label}` : ''}
          </Text>
          {activeCategory ? (
            <Text className="text-xs text-foreground-secondary">
              {activeCategory.discovered} de {activeCategory.total} descobertos nesta categoria
            </Text>
          ) : null}
        </View>

        <View className="gap-2">
          {catalog.map((item) => (
            <CollectionBookItemRow
              key={item.key}
              item={item}
              discovered={discoveredSet.has(item.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
