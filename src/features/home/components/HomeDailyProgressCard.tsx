import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useHomeDashboard } from '@/features/home/hooks/use-home-dashboard'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HomeStatGrid } from '@/features/home/components/shared/HomeStatGrid'
import { HomeStatPill } from '@/features/home/components/shared/HomeStatPill'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'

export const HomeDailyProgressCard = () => {
  const { daily } = useHomeDashboard()

  return (
    <GameCard variant="default" className="border-primary/25">
      <HomeSectionLabel emoji="📊" title={HOME_UI.dailyProgress.title} tone="accent" />
      <Text className="mt-2 text-3xl font-black text-foreground">{daily.overallPercent}%</Text>
      <Text className="text-xs text-foreground-secondary">do plano de hoje</Text>

      <View className="mt-4">
        <RpgProgressBar value={daily.overallPercent} variant="xp" height="lg" animated />
      </View>

      <HomeStatGrid className="mt-4">
        <HomeStatPill
          emoji="⚔️"
          label={HOME_UI.dailyProgress.missions}
          value={`${daily.missionsCompleted}/${daily.missionsTotal || '—'}`}
          tone="primary"
        />
        <HomeStatPill
          emoji="📋"
          label={HOME_UI.dailyProgress.routines}
          value={
            daily.routinesTotal > 0
              ? `${daily.routinesCompleted}/${daily.routinesTotal}`
              : '—'
          }
          tone="accent"
        />
        <HomeStatPill
          emoji="🌾"
          label={HOME_UI.dailyProgress.study}
          value={`${daily.studySessions} ${HOME_UI.dailyProgress.studyUnit}`}
          tone="gold"
        />
        <HomeStatPill
          emoji="✨"
          label={HOME_UI.dailyProgress.xp}
          value={`+${daily.xpToday}`}
          tone="success"
        />
      </HomeStatGrid>
    </GameCard>
  )
}
