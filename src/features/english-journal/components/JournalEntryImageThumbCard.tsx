import { Pressable, Text, View } from 'react-native';

import { AppImage } from '@/components/ui/AppImage';

import { JOURNAL_UI } from '../constants/journal-ui';

const THUMB_WIDTH = 104;
const THUMB_HEIGHT = 88;

type JournalEntryImageThumbCardProps = {
  uri: string;
  index: number;
  onPress?: () => void;
  onRemove?: () => void;
  removable?: boolean;
};

export const JournalEntryImageThumbCard = ({
  uri,
  index,
  onPress,
  onRemove,
  removable = false,
}: JournalEntryImageThumbCardProps) => (
  <View
    className="overflow-hidden rounded-xl border border-border bg-surface"
    style={{ width: THUMB_WIDTH }}>
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${JOURNAL_UI.imagePreviewLabel(index + 1)}. ${JOURNAL_UI.imageTapToPreview}`}>
      <AppImage
        source={{ uri }}
        surface="journal"
        recyclingKey={uri}
        style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
        contentFit="cover"
      />
    </Pressable>

    <View className="flex-row items-center justify-between border-t border-border px-2 py-1.5">
      <Text className="text-[10px] font-semibold text-foreground-secondary">
        {JOURNAL_UI.imageCardLabel(index + 1)}
      </Text>
      {removable && onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={JOURNAL_UI.removeImage}>
          <Text className="text-[10px] font-bold text-danger">{JOURNAL_UI.removeImageShort}</Text>
        </Pressable>
      ) : null}
    </View>
  </View>
);

export const JOURNAL_IMAGE_THUMB_WIDTH = THUMB_WIDTH;
