import { ScrollView, View } from 'react-native'

import { ChoiceChip } from '@/components/ui/ChoiceChip'
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
        <ChoiceChip
          label={GRAPH_UI.filterAll}
          selected={!filter.spaceKey || filter.spaceKey === 'all'}
          onPress={() => onSpaceChange('all')}
          shape="rounded-full"
        />
        {VAULT_SPACES.map((space) => (
          <ChoiceChip
            key={space.key}
            label={`${space.emoji} ${space.label}`}
            selected={filter.spaceKey === space.key}
            onPress={() => onSpaceChange(space.key)}
            shape="rounded-full"
          />
        ))}
      </View>
    </ScrollView>

    <ChoiceChip
      label={`${reviewsOnly ? '✓ ' : ''}${GRAPH_UI.filterReviewsOnly}`}
      selected={reviewsOnly}
      onPress={() => onReviewsOnlyChange(!reviewsOnly)}
      shape="rounded-full"
      className="self-start"
      accessibilityRole="switch"
      accessibilityState={{ checked: reviewsOnly }}
    />
  </View>
)
