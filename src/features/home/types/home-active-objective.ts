import type { Href } from 'expo-router'

export type HomeActiveObjectiveTone = 'primary' | 'accent' | 'warning' | 'gold'

export type HomeActiveObjective = {
  id: string
  emoji: string
  title: string
  subtitle: string
  percent?: number
  route: Href
  priority: number
  tone: HomeActiveObjectiveTone
}
