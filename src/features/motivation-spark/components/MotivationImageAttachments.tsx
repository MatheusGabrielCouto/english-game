import * as ImagePicker from 'expo-image-picker'
import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'

import { JournalEntryImagePreviewModal } from '@/features/english-journal/components/JournalEntryImagePreviewModal'
import { JournalEntryImageThumbCard } from '@/features/english-journal/components/JournalEntryImageThumbCard'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { MOTIVATION_MAX_IMAGES_PER_SPARK } from '../services/motivation-image-storage'

type MotivationImageAttachmentsProps = {
  images: string[]
  onChange: (images: string[]) => void
  disabled?: boolean
}

export const MotivationImageAttachments = ({
  images,
  onChange,
  disabled = false,
}: MotivationImageAttachmentsProps) => {
  const [picking, setPicking] = useState(false)
  const [preview, setPreview] = useState<{ uri: string; index: number } | null>(null)

  const remainingSlots = MOTIVATION_MAX_IMAGES_PER_SPARK - images.length
  const atLimit = remainingSlots <= 0

  const ensureMediaPermission = async (kind: 'camera' | 'library'): Promise<boolean> => {
    if (kind === 'camera') {
      const current = await ImagePicker.getCameraPermissionsAsync()
      if (current.granted) return true
      const requested = await ImagePicker.requestCameraPermissionsAsync()
      if (!requested.granted) {
        Alert.alert(MOTIVATION_UI.form.imagesPermissionDenied)
        return false
      }
      return true
    }

    const current = await ImagePicker.getMediaLibraryPermissionsAsync()
    if (current.granted) return true
    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!requested.granted) {
      Alert.alert(MOTIVATION_UI.form.imagesPermissionDenied)
      return false
    }
    return true
  }

  const appendAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      if (assets.length === 0) return
      const uris = assets.map((asset) => asset.uri).filter(Boolean)
      const next = [...images, ...uris].slice(0, MOTIVATION_MAX_IMAGES_PER_SPARK)
      onChange(next)
    },
    [images, onChange],
  )

  const handleTakePhoto = async () => {
    if (disabled || picking || atLimit) return
    setPicking(true)
    try {
      const allowed = await ensureMediaPermission('camera')
      if (!allowed) return

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      })

      if (!result.canceled && result.assets.length > 0) {
        appendAssets(result.assets.slice(0, remainingSlots))
      }
    } finally {
      setPicking(false)
    }
  }

  const handlePickFromGallery = async () => {
    if (disabled || picking || atLimit) return
    setPicking(true)
    try {
      const allowed = await ensureMediaPermission('library')
      if (!allowed) return

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
      })

      if (!result.canceled && result.assets.length > 0) {
        appendAssets(result.assets)
      }
    } finally {
      setPicking(false)
    }
  }

  const handleRemove = (index: number) => {
    if (disabled) return
    onChange(images.filter((_, i) => i !== index))
    if (preview?.index === index) {
      setPreview(null)
    }
  }

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-semibold text-foreground">{MOTIVATION_UI.form.imagesLabel}</Text>
        <Text className="mt-1 text-xs text-foreground-secondary">
          {MOTIVATION_UI.form.imagesHint(MOTIVATION_MAX_IMAGES_PER_SPARK)}
        </Text>
        {images.length > 0 ? (
          <Text className="mt-1 text-[10px] font-semibold text-primary">
            {MOTIVATION_UI.form.imagesAttachedCount(images.length, MOTIVATION_MAX_IMAGES_PER_SPARK)}
          </Text>
        ) : null}
      </View>

      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3 py-0.5">
            {images.map((uri, index) => (
              <JournalEntryImageThumbCard
                key={`${uri}-${index}`}
                uri={uri}
                index={index}
                onPress={() => setPreview({ uri, index })}
                onRemove={() => handleRemove(index)}
                removable={!disabled}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}

      {!atLimit ? (
        <View className="flex-row flex-wrap gap-3">
          <Pressable
            onPress={() => void handleTakePhoto()}
            disabled={disabled || picking}
            className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel={MOTIVATION_UI.form.takePhoto}
          >
            <Text className="text-sm font-semibold text-primary">
              {picking ? '…' : `📷 ${MOTIVATION_UI.form.takePhoto}`}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void handlePickFromGallery()}
            disabled={disabled || picking}
            className="rounded-xl border border-border bg-surface px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel={MOTIVATION_UI.form.pickImage}
          >
            <Text className="text-sm font-semibold text-primary">
              {picking ? '…' : `🖼️ ${MOTIVATION_UI.form.pickImage}`}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text className="text-xs text-muted">
          {MOTIVATION_UI.form.imagesLimitReached(MOTIVATION_MAX_IMAGES_PER_SPARK)}
        </Text>
      )}

      <JournalEntryImagePreviewModal
        uri={preview?.uri ?? null}
        index={preview?.index}
        onClose={() => setPreview(null)}
      />
    </View>
  )
}
