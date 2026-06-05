import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { cn } from '@/utils'

import { AppModalShell } from './modal/AppModalShell'

type FormSheetModalProps = {
  visible: boolean
  onClose: () => void
  header: ReactNode
  footer?: ReactNode
  children: ReactNode
  sheetHeightRatio?: number
  sheetClassName?: string
  closeAccessibilityLabel?: string
  enableDismissGesture?: boolean
  showSheetHandle?: boolean
}

export const FormSheetModal = ({
  visible,
  onClose,
  header,
  footer,
  children,
  sheetHeightRatio = 0.88,
  sheetClassName,
  closeAccessibilityLabel = 'Fechar',
  enableDismissGesture = true,
  showSheetHandle = true,
}: FormSheetModalProps) => (
  <AppModalShell
    visible={visible}
    onClose={onClose}
    presentation="sheet"
    sheetHeightRatio={sheetHeightRatio}
    enableDismissGesture={enableDismissGesture}
    showSheetHandle={showSheetHandle}
    backdropAccessibilityLabel={closeAccessibilityLabel}>
    <View className={cn('flex-1', sheetClassName)}>
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
  </AppModalShell>
)

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
})
