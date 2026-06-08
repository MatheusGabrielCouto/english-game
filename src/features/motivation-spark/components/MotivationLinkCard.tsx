import * as WebBrowser from 'expo-web-browser'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import type { MotivationLink } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'

type MotivationLinkCardProps = {
  link: MotivationLink
}

const domainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export const MotivationLinkCard = ({ link }: MotivationLinkCardProps) => {
  const handleOpen = () => {
    void WebBrowser.openBrowserAsync(link.url)
  }

  return (
    <PressableScale
      onPress={handleOpen}
      accessibilityRole="button"
      accessibilityLabel={`${MOTIVATION_UI.form.openLink}: ${link.title || link.url}`}
    >
      <GameCard className="border-accent/25 bg-surface-elevated">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
            <Text className="text-xl">🔗</Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-semibold text-foreground" numberOfLines={2}>
              {link.title || domainFromUrl(link.url)}
            </Text>
            <Text className="mt-1 text-xs text-muted" numberOfLines={1}>
              {link.url}
            </Text>
            <Text className="mt-2 text-xs font-bold uppercase tracking-widest text-accent">
              {MOTIVATION_UI.form.openLink}
            </Text>
          </View>
        </View>
      </GameCard>
    </PressableScale>
  )
}
