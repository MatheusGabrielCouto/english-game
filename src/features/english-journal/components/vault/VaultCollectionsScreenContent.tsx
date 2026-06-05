import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Text, View } from 'react-native'

import { Button } from '@/components'
import { LearningSectionHeader } from '@/features/learning/components/ui'
import type { VaultCollectionRecord } from '@/types/knowledge-vault'

import { COLLECTION_TEMPLATES } from '../../catalogs/collection-templates-catalog'
import { VAULT_UI } from '../../constants/vault-ui'
import { KnowledgeVaultService } from '../../services/knowledge-vault-service'
import { useEnglishJournalStore } from '../../store/english-journal-store'
import { VaultCollectionFormModal } from './VaultCollectionFormModal'
import { VaultCollectionListItem } from './VaultCollectionListItem'
import { VaultEmptyState } from './VaultEmptyState'

export const VaultCollectionsScreenContent = () => {
  const collections = useEnglishJournalStore((s) => s.collections)
  const refresh = useEnglishJournalStore((s) => s.refresh)

  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState<VaultCollectionRecord | null>(null)
  const [templateInitial, setTemplateInitial] = useState<{
    name: string
    description: string
    emoji: string
  } | null>(null)

  useFocusEffect(
    useCallback(() => {
      void refresh()
    }, [refresh]),
  )

  const openCreate = () => {
    setEditing(null)
    setTemplateInitial(null)
    setFormVisible(true)
  }

  const openEdit = (collection: VaultCollectionRecord) => {
    setEditing(collection)
    setTemplateInitial(null)
    setFormVisible(true)
  }

  const openTemplate = (templateKey: string) => {
    const template = COLLECTION_TEMPLATES.find((t) => t.key === templateKey)
    if (!template) return
    setEditing(null)
    setTemplateInitial({
      name: template.name,
      description: template.description,
      emoji: template.emoji,
    })
    setFormVisible(true)
  }

  const handleDelete = (collection: VaultCollectionRecord) => {
    Alert.alert(VAULT_UI.deleteCollection, VAULT_UI.deleteCollectionConfirm, [
      { text: VAULT_UI.cancel, style: 'cancel' },
      {
        text: VAULT_UI.deleteCollectionConfirmAction,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await KnowledgeVaultService.deleteCollection(collection.id)
            await refresh()
          })()
        },
      },
    ])
  }

  const handleSaved = () => {
    void refresh()
  }

  return (
    <View className="gap-4">
      <Button label={VAULT_UI.newCollection} onPress={openCreate} />

      <LearningSectionHeader
        emoji="✨"
        title={VAULT_UI.collectionTemplatesTitle}
        hint={VAULT_UI.collectionTemplatesHint}
      />
      <View className="flex-row flex-wrap gap-2">
        {COLLECTION_TEMPLATES.map((template) => (
          <Button
            key={template.key}
            label={`${template.emoji} ${template.name}`}
            variant="secondary"
            size="sm"
            onPress={() => openTemplate(template.key)}
          />
        ))}
      </View>

      {collections.length > 0 ? (
        <Text className="text-xs text-muted">{VAULT_UI.collectionManageHint}</Text>
      ) : null}

      {collections.length === 0 ? (
        <VaultEmptyState
          emoji="📁"
          title={VAULT_UI.emptyCollectionsTitle}
          body={VAULT_UI.emptyCollectionsBody}
          ctaLabel={VAULT_UI.emptyCollectionsCta}
          onCta={openCreate}
        />
      ) : (
        <View className="gap-3">
          {collections.map((col) => (
            <VaultCollectionListItem
              key={col.id}
              collection={col}
              onEdit={() => openEdit(col)}
              onDelete={() => handleDelete(col)}
            />
          ))}
        </View>
      )}

      <VaultCollectionFormModal
        visible={formVisible}
        editing={editing}
        initial={templateInitial}
        onClose={() => setFormVisible(false)}
        onSaved={handleSaved}
      />
    </View>
  )
}
