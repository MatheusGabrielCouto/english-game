import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppIcon } from '@/components/ui/AppIcon'
import { NETWORK_STATUS_UI } from '@/constants/network-status-ui'
import { theme } from '@/constants'
import { useNetworkStatusStore } from '@/store/network-status-store'

export const NetworkStatusHost = () => {
  const insets = useSafeAreaInsets()
  const isOffline = useNetworkStatusStore((state) => state.isOffline)
  const isReady = useNetworkStatusStore((state) => state.isReady)
  const translateY = useSharedValue(-120)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (!isReady) return

    if (isOffline) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 240 })
      opacity.value = withTiming(1, { duration: 220 })
      return
    }

    translateY.value = withTiming(-120, { duration: 240 })
    opacity.value = withTiming(0, { duration: 180 })
  }, [isOffline, isReady, opacity, translateY])

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  if (!isReady) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        bannerStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 75,
          elevation: 75,
          paddingTop: insets.top + 6,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <View className="mx-4 flex-row items-center gap-3 rounded-2xl border border-warning/40 bg-warning/15 px-4 py-3 shadow-lg">
        <AppIcon name="wifi-off" size={20} color={theme.colors.warning} strokeWidth={2.25} />
        <View className="flex-1">
          <Text className="text-sm font-bold text-warning">{NETWORK_STATUS_UI.offlineTitle}</Text>
          <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary">
            {NETWORK_STATUS_UI.offlineBody}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}
