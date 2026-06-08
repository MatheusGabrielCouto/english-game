import { TextInput, View } from 'react-native'

import { Button } from '@/components'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import type { MotivationSparkListFilter } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'

export type MotivationHubFilterMode = 'all' | 'favorites' | 'pinned' | 'archived'

type MotivationHubFiltersProps = {
  search: string
  mode: MotivationHubFilterMode
  onSearchChange: (value: string) => void
  onModeChange: (mode: MotivationHubFilterMode) => void
}

export const toMotivationListFilter = (
  search: string,
  mode: MotivationHubFilterMode,
): MotivationSparkListFilter => ({
  search: search.trim() || undefined,
  favoritesOnly: mode === 'favorites',
  pinnedOnly: mode === 'pinned',
})

export const MotivationHubFilters = ({
  search,
  mode,
  onSearchChange,
  onModeChange,
}: MotivationHubFiltersProps) => (
  <View className="gap-3">
    <TextInput
      className={`w-full rounded-xl border bg-surface px-4 py-3 text-foreground ${formInputBorderClass(false)}`}
      value={search}
      onChangeText={onSearchChange}
      placeholder={MOTIVATION_UI.hub.searchPlaceholder}
      accessibilityLabel={MOTIVATION_UI.hub.searchPlaceholder}
      clearButtonMode="while-editing"
    />
    <View className="flex-row flex-wrap gap-2">
      <Button
        label={MOTIVATION_UI.hub.filterAll}
        size="sm"
        variant={mode === 'all' ? 'primary' : 'secondary'}
        onPress={() => onModeChange('all')}
      />
      <Button
        label={MOTIVATION_UI.hub.filterFavorites}
        size="sm"
        variant={mode === 'favorites' ? 'primary' : 'secondary'}
        onPress={() => onModeChange('favorites')}
      />
      <Button
        label={MOTIVATION_UI.hub.filterPinned}
        size="sm"
        variant={mode === 'pinned' ? 'primary' : 'secondary'}
        onPress={() => onModeChange('pinned')}
      />
      <Button
        label={MOTIVATION_UI.hub.filterArchived}
        size="sm"
        variant={mode === 'archived' ? 'primary' : 'secondary'}
        onPress={() => onModeChange('archived')}
      />
    </View>
  </View>
)
