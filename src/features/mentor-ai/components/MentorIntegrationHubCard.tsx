import { type Href, router } from 'expo-router'
import { type ReactNode } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { PressableScale } from '@/components/ui/game'
import { routes } from '@/constants/routes'
import type {
    MentorFarmBridgeSnapshot,
    MentorGpsPathSnapshot,
    MentorMotivationBridgeSnapshot,
} from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { resolveMotivationSparkRoute } from '../utils/build-mentor-motivation-bridge'

type IntegrationTileProps = {
  emoji: string
  title: string
  body: string
  chips?: ReactNode
  accent?: 'primary' | 'emerald' | 'amber'
  onPress: () => void
  accessibilityLabel: string
}

const ACCENT_STYLES = {
  primary: {
    tile: 'border-primary/20 bg-primary/5',
    icon: 'border-primary/25 bg-primary/10',
  },
  emerald: {
    tile: 'border-emerald-500/20 bg-emerald-500/5',
    icon: 'border-emerald-500/25 bg-emerald-500/10',
  },
  amber: {
    tile: 'border-amber-500/20 bg-amber-500/5',
    icon: 'border-amber-500/25 bg-amber-500/10',
  },
} as const

const Chip = ({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'amber' }) => {
  const toneClass =
    tone === 'accent'
      ? 'border-accent/35 bg-accent/10'
      : tone === 'amber'
        ? 'border-amber-500/35 bg-amber-500/10'
        : 'border-border/60 bg-background/60'

  return (
    <View className={`rounded-full border px-2.5 py-1 ${toneClass}`}>
      <Text className="text-[10px] font-semibold text-foreground-secondary">{children}</Text>
    </View>
  )
}

const IntegrationTile = ({
  emoji,
  title,
  body,
  chips,
  accent = 'primary',
  onPress,
  accessibilityLabel,
}: IntegrationTileProps) => {
  const styles = ACCENT_STYLES[accent]

  return (
    <PressableScale
      fill
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="w-full">
      <View className={`flex-row gap-3 rounded-2xl border px-3.5 py-3.5 ${styles.tile}`}>
        <View
          className={`h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}>
          <Text className="text-xl">{emoji}</Text>
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="min-w-0 flex-1 text-sm font-bold text-foreground" numberOfLines={1}>
              {title}
            </Text>
            <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background/70">
              <Text className="text-base font-bold text-muted">›</Text>
            </View>
          </View>

          <Text className="mt-1 text-xs leading-5 text-foreground-secondary" numberOfLines={2}>
            {body}
          </Text>

          {chips ? <View className="mt-2.5 flex-row flex-wrap gap-1.5">{chips}</View> : null}
        </View>
      </View>
    </PressableScale>
  )
}

type MentorIntegrationHubCardProps = {
  path: MentorGpsPathSnapshot
  farm: MentorFarmBridgeSnapshot
  motivation: MentorMotivationBridgeSnapshot
}

export const MentorIntegrationHubCard = ({ path, farm, motivation }: MentorIntegrationHubCardProps) => {
  const mission = path.topMission

  const handleOpenGps = () => {
    router.push(routes.learningGps as Href)
  }

  const handleOpenFarm = () => {
    router.push(farm.suggestedRoute as Href)
  }

  const handleOpenMotivation = () => {
    router.push(resolveMotivationSparkRoute(motivation) as Href)
  }

  const handleOpenMission = () => {
    if (!mission?.route) return
    router.push(mission.route as Href)
  }

  const gpsBody = path.nextWorldName
    ? `Próximo: ${path.nextWorldName}${path.nextWorldCefr ? ` (${path.nextWorldCefr})` : ''}`
    : path.worldsUntilAdvanced > 0
      ? MENTOR_AI_UI.dashboard.gpsWorldsChip(path.worldsUntilAdvanced, path.advancedTargetWorld)
      : 'Você chegou ao ápice do GPS.'

  return (
    <View className="gap-2.5">
      <View className="rounded-2xl border border-border/50 bg-background/40 px-3.5 py-3">
        <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
          {MENTOR_AI_UI.dashboard.gpsSyncTitle}
        </Text>
        <Text className="mt-1 text-xs leading-5 text-foreground-secondary">
          {MENTOR_AI_UI.dashboard.gpsSyncBody}
        </Text>
      </View>

      <IntegrationTile
        emoji="🧭"
        title={MENTOR_AI_UI.dashboard.gpsPathTitle}
        body={gpsBody}
        accent="primary"
        onPress={handleOpenGps}
        accessibilityLabel={MENTOR_AI_UI.dashboard.gpsOpenLabel}
        chips={
          <>
            {path.worldsUntilAdvanced > 0 ? (
              <Chip>
                {MENTOR_AI_UI.dashboard.gpsWorldsChip(path.worldsUntilAdvanced, path.advancedTargetWorld)}
              </Chip>
            ) : null}
            {path.isSpeakingDay ? <Chip tone="accent">{MENTOR_AI_UI.dashboard.gpsSpeakingDayChip}</Chip> : null}
          </>
        }
      />

      {mission ? (
        <View className="gap-2.5 rounded-2xl border border-primary/25 bg-primary/5 px-3.5 py-3.5">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="min-w-0 flex-1 text-sm font-bold text-foreground" numberOfLines={1}>
              {mission.emoji} {mission.title}
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {MENTOR_AI_UI.dashboard.gpsMissionLabel}
            </Text>
          </View>
          <Text className="text-xs leading-5 text-foreground-secondary" numberOfLines={2}>
            {mission.description}
          </Text>
          <Button
            label={`${mission.emoji} ${mission.label}`}
            variant="secondary"
            onPress={handleOpenMission}
            accessibilityLabel={mission.label}
          />
        </View>
      ) : null}

      <IntegrationTile
        emoji={farm.suggestedActivityEmoji ?? '🎓'}
        title={MENTOR_AI_UI.dashboard.farmBridgeTitle}
        body={farm.coachMessage}
        accent="emerald"
        onPress={handleOpenFarm}
        accessibilityLabel={farm.suggestedActivityLabel ?? MENTOR_AI_UI.dashboard.farmBridgeTitle}
        chips={
          <>
            <Chip>{MENTOR_AI_UI.dashboard.farmMinutesChip(farm.minutesToday)}</Chip>
            {farm.recentSummary ? <Chip>{farm.recentSummary}</Chip> : null}
          </>
        }
      />

      <IntegrationTile
        emoji="🔥"
        title={MENTOR_AI_UI.dashboard.motivationBridgeTitle}
        body={motivation.dailySparkExcerpt ?? motivation.coachMessage}
        accent="amber"
        onPress={handleOpenMotivation}
        accessibilityLabel={
          motivation.dailySparkTitle
            ? MENTOR_AI_UI.dashboard.motivationOpenSparkLabel
            : MENTOR_AI_UI.dashboard.motivationOpenHubLabel
        }
        chips={
          <>
            {motivation.dailySparkTitle ? <Chip tone="amber">{motivation.dailySparkTitle}</Chip> : null}
            {motivation.openStreak > 0 ? (
              <Chip tone="amber">{MENTOR_AI_UI.dashboard.motivationStreakChip(motivation.openStreak)}</Chip>
            ) : null}
            {motivation.openedToday ? (
              <Chip tone="amber">{MENTOR_AI_UI.dashboard.motivationOpenedChip}</Chip>
            ) : null}
          </>
        }
      />
    </View>
  )
}
