import { BlurView } from 'expo-blur'
import { Platform, Pressable, StyleSheet } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'

import { MODAL_BACKDROP } from '@/constants/modal-ui'

type ModalBackdropProps = {
  opacity: SharedValue<number>
  onPress: () => void
  accessibilityLabel?: string
}

export const ModalBackdrop = ({
  opacity,
  onPress,
  accessibilityLabel = 'Fechar modal',
}: ModalBackdropProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  if (Platform.OS === 'ios') {
    return (
      <Animated.View style={[styles.fill, animatedStyle]} pointerEvents="box-none">
        <BlurView
          intensity={MODAL_BACKDROP.intensity}
          tint={MODAL_BACKDROP.tint}
          style={styles.fill}
        />
        <Pressable
          style={styles.fill}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        />
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[styles.fill, animatedStyle]}>
      <Pressable
        style={[styles.fill, styles.androidBackdrop]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
  androidBackdrop: {
    backgroundColor: `rgba(0, 0, 0, ${MODAL_BACKDROP.androidOpacity})`,
  },
})
