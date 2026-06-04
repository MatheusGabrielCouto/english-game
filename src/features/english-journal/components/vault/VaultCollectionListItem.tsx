import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import type { VaultCollectionRecord } from '@/types/knowledge-vault'

import { VAULT_UI } from '../../constants/vault-ui'

type VaultCollectionListItemProps = {
  collection: VaultCollectionRecord
  onEdit: () => void
  onDelete: () => void
}

export const VaultCollectionListItem = ({
  collection,
  onEdit,
  onDelete,
}: VaultCollectionListItemProps) => (
  <GameCard>
    <View className="flex-row items-start gap-3">
      <View className="rounded-xl border border-border bg-surface px-3 py-2">
        <Text className="text-2xl">{collection.emoji}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-base font-bold text-foreground">{collection.name}</Text>
        {collection.description ? (
          <Text className="mt-1 text-xs text-foreground-secondary" numberOfLines={2}>
            {collection.description}
          </Text>
        ) : null}
        <Text className="mt-2 text-[10px] font-semibold text-primary">
          {VAULT_UI.collectionNotes(collection.entryCount ?? 0)}
        </Text>
      </View>
    </View>

    <View className="mt-3 flex-row gap-2">
      <Button label={VAULT_UI.editCollection} variant="secondary" size="sm" onPress={onEdit} />
      <Button label={VAULT_UI.deleteCollection} variant="danger" size="sm" onPress={onDelete} />
    </View>
  </GameCard>
)
