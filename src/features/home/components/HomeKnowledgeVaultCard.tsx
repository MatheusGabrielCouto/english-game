import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { useVaultEntriesStore } from '@/features/english-journal/store/vault-entries-store'
import { useVaultMetaStore } from '@/features/english-journal/store/vault-meta-store'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HomeStatGrid } from '@/features/home/components/shared/HomeStatGrid'
import { HomeStatPill } from '@/features/home/components/shared/HomeStatPill'
import { HOME_UI } from '@/features/home/constants/home-ui'

export const HomeKnowledgeVaultCard = () => {
  const stats = useVaultMetaStore((s) => s.stats)
  const dueReviews = useVaultEntriesStore((s) => s.dueReviews.length)
  const entries = useVaultEntriesStore((s) => s.entries.length)

  const hasContent = entries > 0 || (stats?.totalEntries ?? 0) > 0

  if (!hasContent) {
    return (
      <PressableScale
        fill
        onPress={() => router.push(routes.englishJournal as Href)}
        accessibilityLabel={HOME_UI.vault.emptyCta}
      >
        <GameCard variant="default" className="border-success/25">
          <HomeSectionLabel emoji="📓" title={HOME_UI.vault.title} tone="success" />
          <Text className="mt-3 text-sm text-foreground-secondary">{HOME_UI.vault.emptyBody}</Text>
          <Text className="mt-2 text-xs font-bold text-success">{HOME_UI.vault.emptyCta} →</Text>
        </GameCard>
      </PressableScale>
    )
  }

  const totalNotes = stats?.totalEntries ?? entries
  const voiceNotes = stats?.totalVoiceNotes ?? 0
  const knowledgeLevel = stats?.knowledgeLevel ?? 1

  return (
    <PressableScale
      fill
      onPress={() => router.push(routes.vault.map as Href)}
      accessibilityRole="button"
      accessibilityLabel={HOME_UI.vault.openMap}
    >
      <GameCard variant="quest" className="border-success/35">
        <HomeSectionLabel emoji="📓" title={HOME_UI.vault.title} tone="success" />

        <HomeStatGrid className="mt-4">
          <HomeStatPill emoji="📝" label={HOME_UI.vault.notes} value={totalNotes} tone="success" />
          <HomeStatPill
            emoji="🔁"
            label={HOME_UI.vault.reviews}
            value={dueReviews}
            tone={dueReviews > 0 ? 'warning' : 'accent'}
          />
          <HomeStatPill emoji="🎙️" label={HOME_UI.vault.voice} value={voiceNotes} tone="primary" />
          <HomeStatPill emoji="🧠" label={HOME_UI.vault.level} value={knowledgeLevel} tone="gold" />
        </HomeStatGrid>

        <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2">
          <Text className="text-xs font-bold text-success">{HOME_UI.vault.openMap}</Text>
          <Text className="text-lg text-foreground-secondary">→</Text>
        </View>
      </GameCard>
    </PressableScale>
  )
}
