import { useCallback } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { FORM_FIELD_SHAKE } from '@/constants/form-validation-ui'

export const useFormFieldShake = () => {
  const offsetX = useSharedValue(0)
  const { offsetPx, stepMs } = FORM_FIELD_SHAKE

  const triggerShake = useCallback(() => {
    offsetX.value = withSequence(
      withTiming(-offsetPx, { duration: stepMs }),
      withTiming(offsetPx, { duration: stepMs }),
      withTiming(-offsetPx * 0.75, { duration: stepMs }),
      withTiming(offsetPx * 0.75, { duration: stepMs }),
      withTiming(0, { duration: stepMs }),
    )
  }, [offsetPx, offsetX, stepMs])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }))

  return { animatedStyle, triggerShake }
}
