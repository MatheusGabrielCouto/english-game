import { type ReactNode, useEffect } from 'react'
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import {
  MODAL_SHEET_DISMISS,
  MODAL_SHEET_SPRING,
  MODAL_SPRING,
  type ModalPresentation,
} from '@/constants/modal-ui'

import { MODAL_KEYBOARD_BEHAVIOR } from '../keyboard-modal'
import { ModalBackdrop } from './ModalBackdrop'
import { ModalSheetHandle } from './ModalSheetHandle'

type AppModalShellProps = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  presentation?: ModalPresentation
  sheetHeightRatio?: number
  dismissOnBackdrop?: boolean
  enableDismissGesture?: boolean
  showSheetHandle?: boolean
  accessibilityViewIsModal?: boolean
  backdropAccessibilityLabel?: string
}

export const AppModalShell = ({
  visible,
  onClose,
  children,
  presentation = 'center',
  sheetHeightRatio = 0.88,
  dismissOnBackdrop = true,
  enableDismissGesture = true,
  showSheetHandle = true,
  accessibilityViewIsModal = true,
  backdropAccessibilityLabel = 'Fechar modal',
}: AppModalShellProps) => {
  const { height: windowHeight } = useWindowDimensions()
  const sheetHeight = Math.round(windowHeight * sheetHeightRatio)

  const backdropOpacity = useSharedValue(0)
  const panelProgress = useSharedValue(0)
  const dragOffsetY = useSharedValue(0)

  useEffect(() => {
    if (!visible) {
      backdropOpacity.value = 0
      panelProgress.value = 0
      dragOffsetY.value = 0
      return
    }

    dragOffsetY.value = 0
    backdropOpacity.value = 0
    panelProgress.value = 0
    backdropOpacity.value = withSpring(1, MODAL_SPRING)
    panelProgress.value = withSpring(1, presentation === 'sheet' ? MODAL_SHEET_SPRING : MODAL_SPRING)
  }, [backdropOpacity, dragOffsetY, panelProgress, presentation, visible])

  const handleBackdropPress = () => {
    if (!dismissOnBackdrop) return
    onClose()
  }

  const centerPanelStyle = useAnimatedStyle(() => ({
    opacity: panelProgress.value,
    transform: [
      {
        scale: interpolate(panelProgress.value, [0, 1], [0.94, 1]),
      },
    ],
  }))

  const sheetPanelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(panelProgress.value, [0, 1], [sheetHeight, 0]) + dragOffsetY.value,
      },
    ],
  }))

  const panGesture = Gesture.Pan()
    .enabled(presentation === 'sheet' && enableDismissGesture && visible)
    .onUpdate((event) => {
      dragOffsetY.value = Math.max(0, event.translationY)
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY > MODAL_SHEET_DISMISS.distanceThreshold ||
        event.velocityY > MODAL_SHEET_DISMISS.velocityThreshold

      if (shouldDismiss) {
        dragOffsetY.value = withSpring(sheetHeight, MODAL_SHEET_SPRING, (finished) => {
          if (finished) runOnJS(onClose)()
        })
        return
      }

      dragOffsetY.value = withSpring(0, MODAL_SHEET_SPRING)
    })

  if (!visible) return null

  const sheetContent = (
    <Animated.View
      style={[{ height: sheetHeight }, sheetPanelStyle]}
      className="overflow-hidden rounded-t-3xl border border-border bg-background">
      {showSheetHandle ? <ModalSheetHandle /> : null}
      {children}
    </Animated.View>
  )

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.avoiding}
        behavior={MODAL_KEYBOARD_BEHAVIOR}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (presentation === 'sheet' ? 6 : 12) : 0}>
        <View
          className={presentation === 'sheet' ? 'flex-1 justify-end' : 'flex-1 items-center justify-center px-6 py-6'}
          accessibilityViewIsModal={accessibilityViewIsModal}>
          <ModalBackdrop
            opacity={backdropOpacity}
            onPress={handleBackdropPress}
            accessibilityLabel={backdropAccessibilityLabel}
          />

          {presentation === 'center' ? (
            <Animated.View style={[styles.centerPanel, centerPanelStyle]}>{children}</Animated.View>
          ) : enableDismissGesture ? (
            <GestureDetector gesture={panGesture}>
              <Animated.View style={styles.sheetWrapper}>{sheetContent}</Animated.View>
            </GestureDetector>
          ) : (
            <Animated.View style={styles.sheetWrapper}>{sheetContent}</Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  avoiding: {
    flex: 1,
  },
  centerPanel: {
    zIndex: 10,
    width: '100%',
    maxWidth: 384,
    alignSelf: 'center',
  },
  sheetWrapper: {
    zIndex: 10,
    width: '100%',
  },
})
