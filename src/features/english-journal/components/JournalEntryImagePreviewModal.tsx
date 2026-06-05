import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppImage } from '@/components/ui/AppImage';

import { JOURNAL_UI } from '../constants/journal-ui';

type JournalEntryImagePreviewModalProps = {
  uri: string | null;
  index?: number;
  onClose: () => void;
};

const HEADER_HEIGHT = 52;
const FOOTER_HEIGHT = 76;

export const JournalEntryImagePreviewModal = ({
  uri,
  index,
  onClose,
}: JournalEntryImagePreviewModalProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const horizontalPadding = 16;
  const imageWidth = Math.max(windowWidth - horizontalPadding * 2, 1);
  const imageMaxHeight = Math.max(
    windowHeight - insets.top - insets.bottom - HEADER_HEIGHT - FOOTER_HEIGHT - 24,
    200,
  );

  const title =
    index != null ? JOURNAL_UI.imagePreviewTitle(index + 1) : JOURNAL_UI.imagePreviewTitleGeneric;

  return (
    <Modal
      visible={uri != null}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8, height: HEADER_HEIGHT + insets.top + 8 }]}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle}>{JOURNAL_UI.imagePreviewSubtitle}</Text>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={JOURNAL_UI.closeImagePreview}
            style={({ pressed }) => [styles.closeIconButton, pressed && styles.closeIconButtonPressed]}>
            <Text style={styles.closeIconLabel}>×</Text>
          </Pressable>
        </View>

        <View style={styles.imageArea}>
          {uri ? (
            <View style={[styles.imageFrame, { maxHeight: imageMaxHeight }]}>
              <AppImage
                source={{ uri }}
                surface="journal"
                recyclingKey={uri}
                style={{ width: imageWidth, height: imageMaxHeight }}
                contentFit="contain"
                accessibilityLabel={title}
              />
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 12, minHeight: FOOTER_HEIGHT + insets.bottom + 12 },
          ]}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={JOURNAL_UI.closeImagePreview}
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
            <Text style={styles.closeButtonLabel}>{JOURNAL_UI.closeImagePreview}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
  },
  closeIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  closeIconButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  closeIconLabel: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  imageFrame: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#000000',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
  },
  closeButtonPressed: {
    opacity: 0.9,
  },
  closeButtonLabel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
