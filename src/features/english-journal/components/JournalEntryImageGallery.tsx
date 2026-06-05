import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppImage } from '@/components/ui/AppImage';

import { JOURNAL_UI } from '../constants/journal-ui';
import { JournalEntryImagePreviewModal } from './JournalEntryImagePreviewModal';
import { JournalEntryImageThumbCard } from './JournalEntryImageThumbCard';

type JournalEntryImageGalleryProps = {
  images: string[];
  compact?: boolean;
};

export const JournalEntryImageGallery = ({ images, compact = false }: JournalEntryImageGalleryProps) => {
  const [preview, setPreview] = useState<{ uri: string; index: number } | null>(null);

  if (images.length === 0) return null;

  if (compact) {
    const thumbSize = 56;
    return (
      <>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 py-0.5">
            {images.map((uri, index) => (
              <Pressable
                key={`${uri}-${index}`}
                onPress={() => setPreview({ uri, index })}
                accessibilityRole="button"
                accessibilityLabel={JOURNAL_UI.imagePreviewLabel(index + 1)}>
                <AppImage
                  source={{ uri }}
                  surface="journal"
                  recyclingKey={uri}
                  style={{ width: thumbSize, height: thumbSize }}
                  className="rounded-xl border border-border bg-surface"
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <JournalEntryImagePreviewModal
          uri={preview?.uri ?? null}
          index={preview?.index}
          onClose={() => setPreview(null)}
        />
      </>
    );
  }

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 py-0.5">
          {images.map((uri, index) => (
            <JournalEntryImageThumbCard
              key={`${uri}-${index}`}
              uri={uri}
              index={index}
              onPress={() => setPreview({ uri, index })}
            />
          ))}
        </View>
      </ScrollView>

      <JournalEntryImagePreviewModal
        uri={preview?.uri ?? null}
        index={preview?.index}
        onClose={() => setPreview(null)}
      />
    </>
  );
};
