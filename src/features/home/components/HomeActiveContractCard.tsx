import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { HomeStatGrid } from '@/features/home/components/shared/HomeStatGrid'
import { HomeStatPill } from '@/features/home/components/shared/HomeStatPill'
import { routes } from '@/constants'
import { useContractsStore } from '@/features/contracts/store/contracts-store'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { toProgressPercent } from '@/utils/progress'

export const HomeActiveContractCard = () => {
  const activeContract = useContractsStore((s) => s.activeContract)

  if (!activeContract) {
    return (
      <PressableScale
        fill
        onPress={() => router.push(routes.contracts as Href)}
        accessibilityLabel={HOME_UI.contract.emptyCta}
      >
        <GameCard variant="default" className="border-warning/20">
          <HomeSectionLabel emoji="📜" title={HOME_UI.contract.title} tone="warning" />
          <Text className="mt-3 text-base font-bold text-foreground">{HOME_UI.contract.emptyTitle}</Text>
          <Text className="mt-1 text-sm text-foreground-secondary">{HOME_UI.contract.emptyBody}</Text>
          <Text className="mt-3 text-xs font-bold text-warning">{HOME_UI.contract.emptyCta} →</Text>
        </GameCard>
      </PressableScale>
    )
  }

  const percent = toProgressPercent(activeContract.progressDays, activeContract.targetDays)

  return (
    <PressableScale
      fill
      onPress={() => router.push(routes.contracts as Href)}
      accessibilityRole="button"
      accessibilityLabel={`Contrato ${activeContract.name}`}
    >
      <GameCard variant="reward" glow className="border-warning/40">
        <HomeSectionLabel emoji="📜" title={HOME_UI.contract.title} tone="warning" />
        <Text className="mt-2 text-xl font-black text-foreground">{activeContract.name}</Text>
        <Text className="mt-1 text-sm leading-5 text-foreground-secondary">
          {activeContract.progressDays}/{activeContract.targetDays} dias · {activeContract.daysRemaining}{' '}
          {HOME_UI.contract.daysLeft}
        </Text>

        <View className="mt-4">
          <RpgProgressBar value={percent} variant="gold" height="lg" animated />
        </View>

        <HomeStatGrid className="mt-4">
          <HomeStatPill emoji="🎁" label={HOME_UI.contract.reward} value="Ver detalhes" tone="gold" />
          <HomeStatPill
            emoji="⚠️"
            label={HOME_UI.contract.risk}
            value={`-${activeContract.stakeAmount}`}
            tone="warning"
          />
          <HomeStatPill
            emoji="⏳"
            label={HOME_UI.contract.stake}
            value={`${activeContract.daysRemaining}d`}
            tone="accent"
          />
        </HomeStatGrid>
      </GameCard>
    </PressableScale>
  )
}
