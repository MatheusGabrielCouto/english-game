import { StyleSheet, View } from 'react-native'

import { Toast } from '@/components/ui/Toast'
import { useFeedbackStore } from '@/features/feedback/store/feedback-store'

export const ToastHost = () => {
  const toast = useFeedbackStore((state) => state.activeToast)
  const dismissToast = useFeedbackStore((state) => state.dismissToast)

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant ?? 'success'}
        durationMs={toast?.durationMs ?? 2800}
        toastKey={toast?.id}
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
