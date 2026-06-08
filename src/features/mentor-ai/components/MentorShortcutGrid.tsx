import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { LearningModeTile, LearningSectionHeader } from '@/features/learning/components/ui'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

const MAIN_SHORTCUTS = [
  {
    key: 'chat',
    ...MENTOR_AI_UI.shortcuts.chat,
    route: routes.mentor.chat,
    variant: 'ranked' as const,
  },
  {
    key: 'correct',
    ...MENTOR_AI_UI.shortcuts.correct,
    route: routes.mentor.correct,
    variant: 'dojo' as const,
  },
  {
    key: 'exercise',
    ...MENTOR_AI_UI.shortcuts.exercise,
    route: routes.mentor.exercise,
    variant: 'review' as const,
  },
  {
    key: 'roleplay',
    ...MENTOR_AI_UI.shortcuts.roleplay,
    route: routes.mentor.roleplay,
    variant: 'boss' as const,
  },
] as const

export const MentorShortcutGrid = () => (
  <View className="gap-3">
    <LearningSectionHeader
      emoji="⚡"
      title={MENTOR_AI_UI.dashboard.practiceTitle}
      hint={MENTOR_AI_UI.dashboard.practiceHint}
    />

    <View className="gap-2.5">
      {MAIN_SHORTCUTS.map((shortcut) => (
        <LearningModeTile
          key={shortcut.key}
          emoji={shortcut.emoji}
          title={shortcut.label}
          description={shortcut.description}
          variant={shortcut.variant}
          onPress={() => router.push(shortcut.route as Href)}
          accessibilityLabel={shortcut.label}
        />
      ))}
    </View>

    <GameCard variant="default" className="gap-2 p-4">
      {[MENTOR_AI_UI.shortcuts.history, MENTOR_AI_UI.shortcuts.settings].map((shortcut) => (
        <PressableScale
          key={shortcut.route}
          fill
          onPress={() => router.push(shortcut.route as Href)}
          accessibilityRole="button"
          accessibilityLabel={shortcut.label}
          className="w-full">
          <View className="flex-row items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-3">
            <Text className="text-xl">{shortcut.emoji}</Text>
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-bold text-foreground">{shortcut.label}</Text>
              <Text className="text-xs text-foreground-secondary">{shortcut.description}</Text>
            </View>
            <View className="h-7 w-7 shrink-0 items-center justify-center">
              <Text className="text-base font-bold text-muted">›</Text>
            </View>
          </View>
        </PressableScale>
      ))}
    </GameCard>
  </View>
)
