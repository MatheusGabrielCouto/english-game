import { Pressable, ScrollView, Text, View } from 'react-native'

import { cn } from '@/utils'
import type { KnowledgeGraphFilter, VaultSpaceKey } from '@/types/knowledge-vault'

import { VAULT_SPACES } from '../../catalogs/vault-spaces-catalog'
import { GRAPH_UI } from '../../constants/vault-graph-ui'

type KnowledgeMapFiltersProps = {
  filter: KnowledgeGraphFilter
  reviewsOnly: boolean
  onSpaceChange: (spaceKey: VaultSpaceKey | 'all') => void
  onReviewsOnlyChange: (value: boolean) => void
}

export const KnowledgeMapFilters = ({
  filter,
  reviewsOnly,
  onSpaceChange,
  onReviewsOnlyChange,
}: KnowledgeMapFiltersProps) => (
  <View className="gap-2">
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        <FilterChip
          label={GRAPH_UI.filterAll}
          selected={!filter.spaceKey || filter.spaceKey === 'all'}
          onPress={() => onSpaceChange('all')}
        />
        {VAULT_SPACES.map((space) => (
          <FilterChip
            key={space.key}
            label={`${space.emoji} ${space.label}`}
            selected={filter.spaceKey === space.key}
            onPress={() => onSpaceChange(space.key)}
          />
        ))}
      </View>
    </ScrollView>

    <Pressable
      onPress={() => onReviewsOnlyChange(!reviewsOnly)}
      className={cn(
        'self-start rounded-full border px-3 py-1.5',
        reviewsOnly ? 'border-warning bg-warning/15' : 'border-border bg-surface',
      )}
      accessibilityRole="switch"
      accessibilityState={{ checked: reviewsOnly }}
    >
      <Text
        className={cn(
          'text-xs font-semibold',
          reviewsOnly ? 'text-warning' : 'text-foreground-secondary',
        )}
      >
        {reviewsOnly ? '✓ ' : ''}
        {GRAPH_UI.filterReviewsOnly}
      </Text>
    </Pressable>
  </View>
)

const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) => (
  <Pressable
    onPress={onPress}
    className={cn(
      'rounded-full border px-3 py-1.5',
      selected ? 'border-primary bg-primary/15' : 'border-border bg-surface',
    )}
  >
    <Text className={cn('text-xs font-semibold', selected ? 'text-primary' : 'text-foreground')}>
      {label}
    </Text>
  </Pressable>
)
