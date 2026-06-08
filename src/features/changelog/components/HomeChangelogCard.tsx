import { Pressable, Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'

import { CHANGELOG_UI } from '../constants/changelog-ui'
import { useChangelogCard } from '../hooks/use-changelog-card'

export const HomeChangelogCard = () => {
  const { entry, shouldShow, dismiss } = useChangelogCard()

  if (!shouldShow || !entry) return null

  return (
    <GameCard variant="reward" className="border-primary/35">
      <View className="flex-row items-start justify-between gap-2">
        <HomeSectionLabel emoji={entry.emoji} title={CHANGELOG_UI.sectionTitle} tone="primary" />
        <Pressable
          onPress={dismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={CHANGELOG_UI.dismissAccessibility}
          className="rounded-full border border-border px-2.5 py-1">
          <Text className="text-xs font-bold text-muted">✕</Text>
        </Pressable>
      </View>

      <View className="mt-2 flex-row flex-wrap items-center gap-2">
        <Text className=" font-black text-foreground">{entry.title}</Text>
        <View className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-primary">
            {CHANGELOG_UI.versionLabel(entry.version)}
          </Text>
        </View>
      </View>

      <View className="mt-3 gap-2">
        {entry.highlights.map((line) => (
          <View key={line} className="flex-row gap-2">
            <Text className="text-sm text-primary">•</Text>
            <Text className="min-w-0 flex-1 text-sm leading-5 text-foreground-secondary">{line}</Text>
          </View>
        ))}
      </View>

      <Button label={CHANGELOG_UI.dismissCta} variant="secondary" className="mt-4" onPress={dismiss} />
    </GameCard>
  )
}
