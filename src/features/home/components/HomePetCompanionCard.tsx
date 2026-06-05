import { type Href, router } from 'expo-router'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { GameCard, PressableScale } from '@/components/ui/game'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeStatGrid } from '@/features/home/components/shared/HomeStatGrid'
import { HomeStatPill } from '@/features/home/components/shared/HomeStatPill'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { routes, SHARED_TRANSITION_TAGS } from '@/constants'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { PET_ANIMATIONS_BY_KEY } from '@/features/pet/catalogs/pet-animations-catalog'
import { usePet } from '@/features/pet/hooks/use-pet'
import { getAffinityTier } from '@/features/pet/utils/affinity'
import { PetBestActionHighlight } from '@/features/pet/components/PetBestActionHighlight'
import { getPetDisplayInfo, isPetIncubating } from '@/features/pet/utils/display'
import { getPetRecommendedAction } from '@/features/pet/utils/get-pet-recommended-action'
import { getPetXPProgress } from '@/features/pet/utils/xp'
import { PetMood } from '@/types/pet'

const MOOD_BOUNCE: Record<string, number> = {
  [PetMood.VERY_HAPPY]: -10,
  [PetMood.HAPPY]: -7,
  [PetMood.NORMAL]: -4,
  [PetMood.SAD]: -2,
  [PetMood.VERY_SAD]: 0,
}

export const HomePetCompanionCard = () => {
  const { pet, isLoading } = usePet()
  const bounce = useSharedValue(0)

  useEffect(() => {
    if (!pet) return
    const offset = MOOD_BOUNCE[pet.mood] ?? -4
    if (pet.routinePhase === 'sleeping' || offset === 0) {
      bounce.value = withRepeat(
        withSequence(withTiming(2, { duration: 1200 }), withTiming(0, { duration: 1200 })),
        -1,
        true,
      )
      return
    }
    bounce.value = withRepeat(
      withSequence(withTiming(offset, { duration: 800 }), withTiming(0, { duration: 800 })),
      -1,
      true,
    )
  }, [bounce, pet])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }))

  if (isLoading && !pet) {
    return <HomeCardSkeleton />
  }

  if (!pet) {
    return (
      <PressableScale fill onPress={() => router.push(routes.pet as Href)} accessibilityLabel={HOME_UI.pet.emptyCta}>
        <GameCard variant="default" className="border-legendary/25">
          <HomeSectionLabel emoji="🐾" title={HOME_UI.pet.title} tone="legendary" />
          <Text className="mt-3 text-lg font-black text-foreground">{HOME_UI.pet.emptyTitle}</Text>
          <Text className="mt-1 text-sm text-foreground-secondary">{HOME_UI.pet.emptyBody}</Text>
          <Text className="mt-3 text-xs font-bold text-legendary">{HOME_UI.pet.emptyCta} →</Text>
        </GameCard>
      </PressableScale>
    )
  }

  const display = getPetDisplayInfo(pet)
  const affinityTier = getAffinityTier(pet.affinity)
  const incubating = isPetIncubating(pet)
  const animation = PET_ANIMATIONS_BY_KEY[pet.currentAnimationKey]
  const { current, required } = getPetXPProgress(pet.level, pet.experience)
  const recommendedAction = incubating ? null : getPetRecommendedAction(pet)

  return (
    <PressableScale
      fill
      onPress={() => router.push(routes.pet as Href)}
      accessibilityRole="button"
      accessibilityLabel={HOME_UI.pet.viewPet}
    >
      <GameCard
        variant="quest"
        glow
        sharedTransitionTag={SHARED_TRANSITION_TAGS.petHero}
        className="border-legendary/35 overflow-hidden">
        <View className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-legendary/10" />
        <HomeCardRow className="gap-3">
          <Animated.View
            style={animatedStyle}
            className="shrink-0 rounded-2xl border-2 border-legendary/40 bg-legendary/10 px-3 py-2"
          >
            <Text className="text-5xl leading-none">{display.displayEmoji}</Text>
            {animation?.emoji ? (
              <Text className="absolute -right-1 -top-1 text-2xl">{animation.emoji}</Text>
            ) : null}
          </Animated.View>

          <View className={HOME_LAYOUT.growBlock}>
            <HomeSectionLabel emoji="🐾" title={HOME_UI.pet.title} tone="legendary" />
            <Text className="mt-1 text-xl font-black text-foreground" numberOfLines={2}>
              {display.name}
            </Text>
            <Text className="text-sm leading-5 text-foreground-secondary" numberOfLines={2}>
              {display.speciesName} · {display.stageLabel} · Nv. {display.level}
            </Text>
            <Text className="mt-1 text-xs text-foreground-secondary">
              {display.moodEmoji} {display.moodLabel}
              {incubating ? ' · incubando' : ''}
            </Text>
          </View>
        </HomeCardRow>

        {recommendedAction ? (
          <View className="mt-4">
            <PetBestActionHighlight action={recommendedAction} compact />
          </View>
        ) : null}

        <HomeStatGrid className="mt-4">
          <HomeStatPill emoji="⚡" label={HOME_UI.pet.energy} value={`${pet.energy}%`} tone="accent" />
          <HomeStatPill
            emoji={affinityTier.emoji}
            label={HOME_UI.pet.affinity}
            value={pet.affinity}
            tone="gold"
          />
        </HomeStatGrid>

        <View className="mt-4">
          <RpgProgressBar
            value={current}
            max={required}
            variant="xp"
            height="md"
            label={`XP do pet · ${current}/${required}`}
          />
        </View>
      </GameCard>
    </PressableScale>
  )
}
