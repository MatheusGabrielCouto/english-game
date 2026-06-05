import { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Button, FormSheetModal } from '@/components'
import { theme } from '@/constants'
import type { VaultCollectionRecord } from '@/types/knowledge-vault'
import { cn } from '@/utils'

import {
    COLLECTION_EMOJI_PRESETS,
    COLLECTION_FORM_LIMITS,
} from '../../constants/collection-form-limits'
import { VAULT_UI } from '../../constants/vault-ui'
import { KnowledgeVaultService } from '../../services/knowledge-vault-service'
import {
    validateCollectionDescription,
    validateCollectionForm,
    validateCollectionName,
} from '../../utils/collection-form-input'
import { VaultField } from './VaultField'

type VaultCollectionFormModalProps = {
  visible: boolean
  editing: VaultCollectionRecord | null
  initial?: { name: string; description: string; emoji: string } | null
  onClose: () => void
  onSaved: () => void
}

export const VaultCollectionFormModal = ({
  visible,
  editing,
  initial,
  onClose,
  onSaved,
}: VaultCollectionFormModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState<string>(COLLECTION_EMOJI_PRESETS[0])
  const [saving, setSaving] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setSubmitAttempted(false)
    setFormError(null)
    if (editing) {
      setName(editing.name)
      setDescription(editing.description ?? '')
      setEmoji(editing.emoji)
      return
    }
    if (initial) {
      setName(initial.name)
      setDescription(initial.description)
      setEmoji(initial.emoji)
      return
    }
    setName('')
    setDescription('')
    setEmoji(COLLECTION_EMOJI_PRESETS[0])
  }, [visible, editing, initial])

  const formValidation = useMemo(
    () => validateCollectionForm({ name, description }),
    [name, description],
  )

  const nameValidation = useMemo(() => validateCollectionName(name), [name])
  const descriptionValidation = useMemo(() => validateCollectionDescription(description), [description])

  const handleSave = async () => {
    setSubmitAttempted(true)
    if (!formValidation.valid) {
      setFormError(formValidation.error ?? VAULT_UI.collectionFormError)
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        emoji,
      }
      if (editing) {
        await KnowledgeVaultService.updateCollection(editing.id, payload)
      } else {
        await KnowledgeVaultService.createCollection({
          name: payload.name,
          description: payload.description ?? undefined,
          emoji: payload.emoji,
        })
      }
      onSaved()
      onClose()
    } catch {
      setFormError(VAULT_UI.collectionSaveError)
    } finally {
      setSaving(false)
    }
  }

  const title = editing ? VAULT_UI.editCollection : VAULT_UI.newCollection

  return (
    <FormSheetModal
      visible={visible}
      onClose={onClose}
      sheetHeightRatio={0.82}
      backdropClassName="bg-black/50"
      header={
        <View className="px-4 pb-2 pt-4">
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />
          <Text className="text-lg font-black text-foreground">{title}</Text>
        </View>
      }
      footer={
        <View className="flex-row gap-2 px-4 pb-8 pt-2">
          <Button
            label={VAULT_UI.cancel}
            variant="secondary"
            className="flex-1"
            onPress={onClose}
            disabled={saving}
          />
          <Button
            label={VAULT_UI.saveCollection}
            className="flex-1"
            onPress={() => void handleSave()}
            loading={saving}
            disabled={saving}
          />
        </View>
      }>
      <View className="gap-4 px-4 pb-4">
                <VaultField label={VAULT_UI.collectionEmojiLabel}>
                  <View className="flex-row flex-wrap gap-2">
                    {COLLECTION_EMOJI_PRESETS.map((preset) => (
                      <Pressable
                        key={preset}
                        onPress={() => setEmoji(preset)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: emoji === preset }}
                        className={cn(
                          'h-11 w-11 items-center justify-center rounded-xl border',
                          emoji === preset
                            ? 'border-primary bg-primary/15'
                            : 'border-border bg-surface',
                        )}
                      >
                        <Text className="text-xl">{preset}</Text>
                      </Pressable>
                    ))}
                  </View>
                </VaultField>

                <VaultField label={VAULT_UI.collectionNameLabel}>
                  <TextInput
                    className={cn(
                      'rounded-xl border bg-surface px-4 py-3 text-base text-foreground',
                      submitAttempted && !nameValidation.valid
                        ? 'border-danger'
                        : 'border-border',
                    )}
                    value={name}
                    onChangeText={setName}
                    placeholder={VAULT_UI.collectionNamePlaceholder}
                    placeholderTextColor={theme.colors.muted}
                    maxLength={COLLECTION_FORM_LIMITS.nameMax}
                    accessibilityLabel={VAULT_UI.collectionNameLabel}
                  />
                  {submitAttempted && nameValidation.error ? (
                    <Text className="mt-1 text-xs text-danger">{nameValidation.error}</Text>
                  ) : null}
                </VaultField>

                <VaultField
                  label={VAULT_UI.collectionDescriptionLabel}
                  hint={VAULT_UI.collectionDescriptionPlaceholder}
                >
                  <TextInput
                    className={cn(
                      'min-h-[88px] rounded-xl border bg-surface px-4 py-3 text-base text-foreground',
                      submitAttempted && !descriptionValidation.valid
                        ? 'border-danger'
                        : 'border-border',
                    )}
                    style={{ textAlignVertical: 'top' }}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={VAULT_UI.collectionDescriptionPlaceholder}
                    placeholderTextColor={theme.colors.muted}
                    multiline
                    maxLength={COLLECTION_FORM_LIMITS.descriptionMax}
                  />
                  {submitAttempted && descriptionValidation.error ? (
                    <Text className="mt-1 text-xs text-danger">{descriptionValidation.error}</Text>
                  ) : null}
                </VaultField>

        {formError ? <Text className="text-sm text-danger">{formError}</Text> : null}
      </View>
    </FormSheetModal>
  )
}
