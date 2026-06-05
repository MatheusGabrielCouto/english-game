import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'

import { PET_FARM_ONBOARDING_UI } from '../constants/pet-farm-onboarding-ui'

type PetFarmOnboardingWelcomeCardProps = {
  onStart: () => void
  onSkip: () => void
}

export const PetFarmOnboardingWelcomeCard = ({
  onStart,
  onSkip,
}: PetFarmOnboardingWelcomeCardProps) => (
  <GameCard variant="hero" glow className="gap-3 border-emerald-500/35 bg-emerald-950/20">
    <View className="flex-row items-start gap-3">
      <Text className="text-3xl">{PET_FARM_ONBOARDING_UI.welcome.emoji}</Text>
      <View className="min-w-0 flex-1">
        <Text className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Primeira visita
        </Text>
        <Text className="mt-1 text-lg font-black text-foreground">
          {PET_FARM_ONBOARDING_UI.welcome.title}
        </Text>
        <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">
          {PET_FARM_ONBOARDING_UI.welcome.body}
        </Text>
      </View>
    </View>

    <View className="gap-2">
      <Button label={PET_FARM_ONBOARDING_UI.welcome.startCta} onPress={onStart} />
      <Button
        label={PET_FARM_ONBOARDING_UI.welcome.skipCta}
        variant="ghost"
        onPress={onSkip}
      />
    </View>
  </GameCard>
)
