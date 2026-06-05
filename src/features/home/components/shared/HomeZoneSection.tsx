import { type ReactNode } from 'react'
import { View } from 'react-native'

import { HomeSectionLabel } from './HomeSectionLabel'

type HomeZoneSectionProps = {
  emoji: string
  title: string
  subtitle?: string
  children: ReactNode
}

export const HomeZoneSection = ({ emoji, title, subtitle, children }: HomeZoneSectionProps) => (
  <View className="gap-4">
    <HomeSectionLabel emoji={emoji} title={title} subtitle={subtitle} tone="accent" />
    <View className="gap-4">{children}</View>
  </View>
)
