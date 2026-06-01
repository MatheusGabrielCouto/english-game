import type { ReactNode } from 'react';
import {
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { cn } from '@/utils';

import { Button } from './Button';

type AppModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
  scrollable?: boolean;
  footerMode?: 'dual' | 'single' | 'none';
};

export const Modal = ({
  visible,
  onRequestClose,
  title,
  description,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  className,
  scrollable = true,
  footerMode = 'dual',
}: AppModalProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const maxBodyHeight = Math.min(windowHeight * 0.55, 420);

  const handleClose = () => {
    onRequestClose();
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  if (!visible) return null;

  const body = children ? (
    scrollable ? (
      <ScrollView
        style={{ maxHeight: maxBodyHeight }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        {children}
      </ScrollView>
    ) : (
      <View>{children}</View>
    )
  ) : null;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent>
      <View className="flex-1 items-center justify-center px-6 py-6" accessibilityViewIsModal>
        <TouchableOpacity
          className="absolute inset-0 bg-black/70"
          activeOpacity={1}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Fechar modal"
        />
        <View
          className={cn(
            'z-10 w-full max-w-sm self-center rounded-2xl border border-border bg-surface p-6',
            className,
          )}>
            <Text className="text-xl font-bold text-foreground">{title}</Text>
            {description ? (
              <Text className="mt-2 text-base text-foreground-secondary">{description}</Text>
            ) : null}
            {body ? <View className="mt-4">{body}</View> : null}
            {footerMode === 'none' ? null : (
              <View className="mt-6 flex-row gap-3">
                {footerMode === 'dual' ? (
                  <View className="flex-1">
                    <Button label={cancelLabel} variant="secondary" onPress={handleCancel} />
                  </View>
                ) : null}
                {onConfirm ? (
                  <View className="flex-1">
                    <Button label={confirmLabel} onPress={handleConfirm} />
                  </View>
                ) : null}
              </View>
            )}
          </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 4,
  },
});
