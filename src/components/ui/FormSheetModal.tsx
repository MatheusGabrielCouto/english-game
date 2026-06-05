import type { ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';

import { cn } from '@/utils';

import { MODAL_KEYBOARD_BEHAVIOR } from './keyboard-modal';

type FormSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  sheetHeightRatio?: number;
  sheetClassName?: string;
  backdropClassName?: string;
  closeAccessibilityLabel?: string;
  animationType?: 'slide' | 'fade';
};

export const FormSheetModal = ({
  visible,
  onClose,
  header,
  footer,
  children,
  sheetHeightRatio = 0.88,
  sheetClassName,
  backdropClassName = 'bg-black/60',
  closeAccessibilityLabel = 'Fechar',
  animationType = 'slide',
}: FormSheetModalProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * sheetHeightRatio);

  return (
    <RNModal visible={visible} transparent animationType={animationType} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.avoiding}
        behavior={MODAL_KEYBOARD_BEHAVIOR}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}>
        <View style={styles.root}>
          <Pressable
            style={StyleSheet.absoluteFill}
            className={backdropClassName}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={closeAccessibilityLabel}
          />

          <View
            style={{ height: sheetHeight }}
            className={cn('overflow-hidden rounded-t-3xl border border-border bg-background', sheetClassName)}>
            {header}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator
              nestedScrollEnabled
              bounces>
              {children}
            </ScrollView>
            {footer}
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  avoiding: {
    flex: 1,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
