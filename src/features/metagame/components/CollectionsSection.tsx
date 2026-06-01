import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { GAME_ITEM_CATALOG, ItemCategory } from '@/features/game-design/catalogs/item-catalog';
import { PET_SPECIES_CATALOG } from '@/features/game-design/catalogs/pet-species-catalog';
import type { CollectionCategoryDetail, CollectionCategoryKey, CollectionSummary } from '@/types/metagame';
import { cn } from '@/utils';

import { getDiscoveredPetKeys } from '../utils/collections';
import { CollectionCategoryCard } from './CollectionCategoryCard';

type CollectionsSectionProps = {
  collections: CollectionSummary;
};

const RARITY_LABEL: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

export const CollectionsSection = ({ collections }: CollectionsSectionProps) => {
  const [selectedKey, setSelectedKey] = useState<CollectionCategoryKey>('pets');
  const [discoveredPetKeys, setDiscoveredPetKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    void getDiscoveredPetKeys().then(setDiscoveredPetKeys);
  }, [collections.pets.discovered]);

  const selectedCategory = collections.categories.find((category) => category.key === selectedKey);

  const handleToggleCategory = (category: CollectionCategoryDetail) => {
    setSelectedKey((current) => (current === category.key ? current : category.key));
  };

  return (
    <View className="gap-4">
      <GameCard variant="hero" glow className="border-primary/30">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">📚 Coleções</Text>
        <Text className="mt-1 text-sm text-foreground-secondary">
          Progresso geral do seu álbum de longo prazo
        </Text>

        <View className="mt-4 flex-row items-end justify-between">
          <View>
            <Text className="text-4xl font-black text-foreground">{collections.overallPercentage}%</Text>
            <Text className="text-xs text-muted">completude total</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-accent">
              {collections.categories.reduce((sum, entry) => sum + entry.discovered, 0)} coletados
            </Text>
            <Text className="text-xs text-muted">
              de {collections.categories.reduce((sum, entry) => sum + entry.total, 0)} itens
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <ProgressBar value={collections.overallPercentage} variant="xp" height="md" showLabel />
        </View>
      </GameCard>

      <View className="flex-row flex-wrap gap-3">
        {collections.categories.map((category) => (
          <View key={category.key} className="w-[47%] flex-grow">
            <CollectionCategoryCard
              category={category}
              selected={selectedKey === category.key}
              onPress={() => handleToggleCategory(category)}
            />
          </View>
        ))}
      </View>

      {selectedCategory ? (
        <Card elevated accent className="border-primary/25">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            {selectedCategory.emoji} Detalhes · {selectedCategory.label}
          </Text>
          <Text className="mt-2 text-sm text-foreground-secondary">{selectedCategory.hint}</Text>

          {selectedKey === 'pets' ? (
            <PetAlbum discoveredKeys={discoveredPetKeys} />
          ) : null}

          {selectedKey === 'relics' ? (
            <RelicGrid />
          ) : null}

          {selectedKey === 'achievements' || selectedKey === 'titles' || selectedKey === 'items' ? (
            <CollectionStatsPanel category={selectedCategory} />
          ) : null}
        </Card>
      ) : null}
    </View>
  );
};

const PetAlbum = ({ discoveredKeys }: { discoveredKeys: Set<string> }) => (
  <View className="mt-4">
    <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Álbum de pets</Text>
    <View className="flex-row flex-wrap gap-2">
      {PET_SPECIES_CATALOG.map((species) => {
        const discovered = discoveredKeys.has(species.key);
        return (
          <View
            key={species.key}
            className={cn(
              'w-[18%] min-w-[56px] items-center rounded-xl border px-1 py-2',
              discovered ? 'border-primary/40 bg-primary/10' : 'border-border/60 bg-surface opacity-45',
            )}>
            <Text className={cn('text-xl', !discovered && 'opacity-30')}>{species.emoji}</Text>
            <Text className="mt-1 text-center text-[9px] font-semibold text-foreground" numberOfLines={1}>
              {discovered ? species.name.split(' ')[0] : '???'}
            </Text>
            <Text className="text-[8px] text-muted">{RARITY_LABEL[species.rarity] ?? species.rarity}</Text>
          </View>
        );
      })}
    </View>
  </View>
);

const RelicGrid = () => {
  const relics = GAME_ITEM_CATALOG.filter((item) => item.category === ItemCategory.RELIC);

  return (
    <View className="mt-4 gap-2">
      {relics.map((relic) => (
        <View key={relic.key} className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
          <Text className="text-2xl">{relic.icon}</Text>
          <View className="flex-1">
            <Text className="text-sm font-bold text-foreground">{relic.name}</Text>
            <Text className="text-xs text-foreground-secondary">{relic.description}</Text>
          </View>
          <Text className="text-[10px] font-bold uppercase text-gold">{RARITY_LABEL[relic.rarity]}</Text>
        </View>
      ))}
    </View>
  );
};

const CollectionStatsPanel = ({ category }: { category: CollectionCategoryDetail }) => (
  <View className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
    <View className="flex-row items-center justify-between">
      <Text className="text-sm font-bold text-foreground">Progresso</Text>
      <Text className="text-sm font-black text-accent">
        {category.discovered}/{category.total}
      </Text>
    </View>
    <View className="mt-3 flex-row flex-wrap gap-2">
      {category.preview.map((icon, index) => (
        <View
          key={`${category.key}-detail-${index}`}
          className="h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-surface-elevated">
          <Text className="text-lg">{icon}</Text>
        </View>
      ))}
    </View>
    {category.discovered < category.total ? (
      <Text className="mt-3 text-xs leading-5 text-muted">
        Faltam {category.total - category.discovered} para completar esta coleção.
      </Text>
    ) : (
      <Text className="mt-3 text-xs font-semibold text-success">Coleção completa! 🎉</Text>
    )}
  </View>
);
