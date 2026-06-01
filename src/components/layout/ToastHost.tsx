import { StyleSheet, View } from 'react-native'

import { Toast } from '@/components/ui/Toast'
import { useFeedbackStore } from '@/features/feedback/store/feedback-store'

export const ToastHost = () => {
  const toast = useFeedbackStore((state) => state.activeToast)
  const dismissToast = useFeedbackStore((state) => state.dismissToast)

  if (!toast) return null

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Toast
        message={toast.message}
        variant={toast.variant}
        durationMs={toast.durationMs}
        toastKey={toast.id}
        onDismiss={dismissToast}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 80,
    elevation: 80,
  },
})
