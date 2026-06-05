import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { JOURNAL_UI } from '../constants/journal-ui';
import { JOURNAL_MAX_IMAGES_PER_ENTRY } from '../services/journal-image-storage';
import { JournalEntryImagePreviewModal } from './JournalEntryImagePreviewModal';
import { JournalEntryImageThumbCard } from './JournalEntryImageThumbCard';

type JournalEntryImageAttachmentsProps = {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
};

export const JournalEntryImageAttachments = ({
  images,
  onChange,
  disabled = false,
}: JournalEntryImageAttachmentsProps) => {
  const [picking, setPicking] = useState(false);
  const [preview, setPreview] = useState<{ uri: string; index: number } | null>(null);

  const remainingSlots = JOURNAL_MAX_IMAGES_PER_ENTRY - images.length;
  const atLimit = remainingSlots <= 0;

  const ensureMediaPermission = async (kind: 'camera' | 'library'): Promise<boolean> => {
    if (kind === 'camera') {
      const current = await ImagePicker.getCameraPermissionsAsync();
      if (current.granted) return true;
      const requested = await ImagePicker.requestCameraPermissionsAsync();
      if (!requested.granted) {
        Alert.alert(JOURNAL_UI.imagesPermissionDenied);
        return false;
      }
      return true;
    }

    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.granted) return true;
    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!requested.granted) {
      Alert.alert(JOURNAL_UI.imagesPermissionDenied);
      return false;
    }
    return true;
  };

  const appendAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      if (assets.length === 0) return;
      const uris = assets.map((asset) => asset.uri).filter(Boolean);
      const next = [...images, ...uris].slice(0, JOURNAL_MAX_IMAGES_PER_ENTRY);
      onChange(next);
    },
    [images, onChange],
  );

  const handleTakePhoto = async () => {
    if (disabled || picking || atLimit) return;
    setPicking(true);
    try {
      const allowed = await ensureMediaPermission('camera');
      if (!allowed) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        appendAssets(result.assets.slice(0, remainingSlots));
      }
    } finally {
      setPicking(false);
    }
  };

  const handlePickFromGallery = async () => {
    if (disabled || picking || atLimit) return;
    setPicking(true);
    try {
      const allowed = await ensureMediaPermission('library');
      if (!allowed) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets.length > 0) {
        appendAssets(result.assets);
      }
    } finally {
      setPicking(false);
    }
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    onChange(images.filter((_, i) => i !== index));
    if (preview?.index === index) {
      setPreview(null);
    }
  };

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-semibold text-foreground">{JOURNAL_UI.imagesLabel}</Text>
        <Text className="mt-1 text-xs text-foreground-secondary">
          {JOURNAL_UI.imagesHint(JOURNAL_MAX_IMAGES_PER_ENTRY)}
        </Text>
        {images.length > 0 ? (
          <Text className="mt-1 text-[10px] font-semibold text-primary">
            {JOURNAL_UI.imagesAttachedCount(images.length, JOURNAL_MAX_IMAGES_PER_ENTRY)}
          </Text>
        ) : null}
      </View>

      {images.length > 0 ? (
        <View className="gap-2">
          <Text className="text-xs text-muted">{JOURNAL_UI.imagesValidateHint}</Text>
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
        </View>
      ) : null}

      {!atLimit ? (
        <View className="flex-row flex-wrap gap-3">
          <Pressable
            onPress={() => void handleTakePhoto()}
            disabled={disabled || picking}
            className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel={JOURNAL_UI.takePhoto}>
            <Text className="text-sm font-semibold text-primary">
              {picking ? '…' : `📷 ${JOURNAL_UI.takePhoto}`}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void handlePickFromGallery()}
            disabled={disabled || picking}
            className="rounded-xl border border-border bg-surface px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel={JOURNAL_UI.pickImage}>
            <Text className="text-sm font-semibold text-primary">
              {picking ? '…' : `🖼️ ${JOURNAL_UI.pickImage}`}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text className="text-xs text-muted">{JOURNAL_UI.imagesLimitReached(JOURNAL_MAX_IMAGES_PER_ENTRY)}</Text>
      )}

      <JournalEntryImagePreviewModal
        uri={preview?.uri ?? null}
        index={preview?.index}
        onClose={() => setPreview(null)}
      />
    </View>
  );
};
