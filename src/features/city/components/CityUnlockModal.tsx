import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

import { Modal } from '@/components/ui/Modal'
import { theme } from '@/constants'
import { CITY_MESSAGES } from '@/features/city/constants/default-buildings'
import { CityService } from '@/features/city/services/city-service'
import { useCityStore } from '@/features/city/store/city-store'
import { useFeedbackStore } from '@/features/feedback/store/feedback-store'
import { TITLES_BY_KEY } from '@/features/titles/constants/default-titles'
import { CityBuildingUnlockAnimation } from './CityBuildingUnlockAnimation'

type UnlockPhase = 'constructing' | 'revealed'

export const CityUnlockModal = () => {
  const celebration = useCityStore((state) => state.celebration)
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti)
  const [phase, setPhase] = useState<UnlockPhase>('constructing')

  const scale = useSharedValue(0.6)
  const glow = useSharedValue(0)

  useEffect(() => {
    if (!celebration) return
    setPhase('constructing')
  }, [celebration?.building.key])

  useEffect(() => {
    if (phase !== 'revealed' || !celebration) return

    scale.value = 0.6
    glow.value = 0
    scale.value = withSpring(1, { damping: 10, stiffness: 120 })
    glow.value = withSequence(withTiming(1, { duration: 400 }), withTiming(0.6, { duration: 800 }))
  }, [phase, celebration, glow, scale])

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.25 + glow.value * 0.45,
  }))

  const handleClose = () => {
    clearConfetti()
    CityService.dequeueCelebration()
    setPhase('constructing')
  }

  const handleConstructComplete = useCallback(() => {
    setPhase('revealed')
  }, [])

  const linkedTitle = celebration
    ? TITLES_BY_KEY[celebration.building.linkedTitleKey]?.name
    : null

  const isConstructing = phase === 'constructing'

  return (
    <Modal
      visible={celebration !== null}
      onRequestClose={handleClose}
      title={isConstructing ? CITY_MESSAGES.constructing : `🏙️ ${CITY_MESSAGES.cityGrown}`}
      description={
        isConstructing
          ? celebration
            ? CITY_MESSAGES.constructingHint(celebration.building.name)
            : undefined
          : CITY_MESSAGES.buildingUnlocked
      }
      confirmLabel="Explorar!"
      cancelLabel="Fechar"
      onConfirm={isConstructing ? undefined : handleClose}
      onCancel={isConstructing ? undefined : handleClose}
      footerMode={isConstructing ? 'none' : 'dual'}
      className="border-accent/40">
      {celebration ? (
        isConstructing ? (
          <CityBuildingUnlockAnimation
            buildingIcon={celebration.building.icon}
            buildingName={celebration.building.name}
            onConstructComplete={handleConstructComplete}
          />
        ) : (
          <View className="items-center gap-4 py-4">
            <Animated.View
              style={[
                badgeStyle,
                {
                  shadowColor: theme.colors.accent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 20,
                  elevation: 10,
                },
              ]}
              className="rounded-2xl border-4 border-accent/50 bg-accent/10 px-8 py-5">
              <Text className="text-6xl">{celebration.building.icon}</Text>
            </Animated.View>
            <Text className="text-center text-2xl font-black text-accent">
              {celebration.building.name}
            </Text>
            <Text className="text-center text-sm text-foreground-secondary">
              {celebration.building.description}
            </Text>
            {linkedTitle ? (
              <Text className="text-center text-sm font-semibold text-primary">
                👑 Título: {linkedTitle}
              </Text>
            ) : null}
            <View className="rounded-xl border border-accent/30 bg-surface-elevated px-4 py-3">
              <Text className="text-center text-sm font-bold text-accent">
                🏗️ Desbloqueado no nível {celebration.levelAtUnlock}
              </Text>
            </View>
          </View>
        )
      ) : null}
    </Modal>
  )
}
