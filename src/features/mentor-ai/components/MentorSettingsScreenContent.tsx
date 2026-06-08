import { type Href, router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Platform, Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { LearningSectionHeader } from '@/features/learning/components/ui'
import { useAsyncAction } from '@/hooks'

import {
  MENTOR_MODEL_FILENAME,
  MENTOR_MODEL_HF_REPO,
} from '../constants/mentor-model'
import { MENTOR_RETENTION_DAY_OPTIONS } from '../constants/mentor-retention'
import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import {
  LocalLLMRuntime,
  MENTOR_LLM_MODEL_LABEL,
} from '../services/local-llm-runtime'
import {
  MentorRetentionService,
  type MentorRetentionConfig,
} from '../services/mentor-retention-service'
import {
  MentorSettingsService,
  type MentorSettingsStats,
} from '../services/mentor-settings-service'
import { MentorLLMService } from '../services/mentor-llm-service'
import { useMentorLlmStore } from '../store/mentor-llm-store'

type StatusTone = 'success' | 'accent' | 'warning' | 'danger' | 'muted'

const STATUS_META: Record<
  string,
  { label: string; hint: string; tone: StatusTone; emoji: string }
> = {
  ready: {
    label: MENTOR_AI_UI.settings.statusReady,
    hint: MENTOR_AI_UI.settings.statusReadyHint,
    tone: 'success',
    emoji: '✅',
  },
  copying: {
    label: MENTOR_AI_UI.settings.statusCopying,
    hint: MENTOR_AI_UI.settings.statusCopyingHint,
    tone: 'accent',
    emoji: '📦',
  },
  loading: {
    label: MENTOR_AI_UI.settings.statusLoading,
    hint: MENTOR_AI_UI.settings.statusLoadingHint,
    tone: 'accent',
    emoji: '⏳',
  },
  missing: {
    label: MENTOR_AI_UI.settings.statusMissing,
    hint: MENTOR_AI_UI.settings.statusMissingHint,
    tone: 'warning',
    emoji: '⚠️',
  },
  error: {
    label: MENTOR_AI_UI.settings.statusError,
    hint: MENTOR_AI_UI.settings.statusErrorHint,
    tone: 'danger',
    emoji: '❌',
  },
  unsupported: {
    label: MENTOR_AI_UI.settings.statusUnsupported,
    hint: MENTOR_AI_UI.settings.statusUnsupportedHint,
    tone: 'muted',
    emoji: '📱',
  },
  idle: {
    label: MENTOR_AI_UI.settings.statusIdle,
    hint: MENTOR_AI_UI.settings.statusIdleHint,
    tone: 'muted',
    emoji: '💤',
  },
}

const toneClasses: Record<StatusTone, { border: string; bg: string; text: string }> = {
  success: { border: 'border-success/40', bg: 'bg-success/10', text: 'text-success' },
  accent: { border: 'border-accent/40', bg: 'bg-accent/10', text: 'text-accent' },
  warning: { border: 'border-warning/40', bg: 'bg-warning/10', text: 'text-warning' },
  danger: { border: 'border-danger/40', bg: 'bg-danger/10', text: 'text-danger' },
  muted: { border: 'border-border/70', bg: 'bg-background/50', text: 'text-muted' },
}

const shortenPath = (path: string): string => {
  if (path.length <= 48) return path
  return `…${path.slice(-44)}`
}

export const MentorSettingsScreenContent = () => {
  const { status, modelPath, error } = useMentorLlmStore()
  const runtime = LocalLLMRuntime.getStatus()
  const [stats, setStats] = useState<MentorSettingsStats | null>(null)
  const [retention, setRetention] = useState<MentorRetentionConfig | null>(null)
  const [lastPruneSummary, setLastPruneSummary] = useState<string | null>(null)
  const [showDevSteps, setShowDevSteps] = useState(false)

  const statusMeta = STATUS_META[status] ?? STATUS_META.idle
  const tone = toneClasses[statusMeta.tone]
  const canRetry = status === 'error' || status === 'missing' || status === 'idle'
  const isNativeLoaded = MentorLLMService.isLoaded()

  const refreshStats = useCallback(async () => {
    const [nextStats, nextRetention] = await Promise.all([
      MentorSettingsService.loadStats(),
      MentorRetentionService.getConfig(),
    ])
    setStats(nextStats)
    setRetention(nextRetention)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void refreshStats()
    }, [refreshStats]),
  )

  const handleRetentionDays = async (days: MentorRetentionConfig['retentionDays']) => {
    const next: MentorRetentionConfig = { enabled: true, retentionDays: days }
    await MentorRetentionService.setConfig(next)
    setRetention(next)
  }

  const handleRetentionDisable = async () => {
    const next: MentorRetentionConfig = {
      enabled: false,
      retentionDays: retention?.retentionDays ?? 90,
    }
    await MentorRetentionService.setConfig(next)
    setRetention(next)
  }

  const { run: runRetentionNow, isPending: isRunningRetention } = useAsyncAction(async () => {
    const result = await MentorRetentionService.runPrune({ force: true })
    if (!result.ran) {
      setLastPruneSummary(MENTOR_AI_UI.settings.retentionNothingRemoved)
      return
    }

    setLastPruneSummary(
      MENTOR_AI_UI.settings.retentionRemovedSummary(
        result.chatSessions,
        result.errorLogs,
        result.topics,
      ),
    )
    await refreshStats()
  })

  const { run: retryModel, isPending: isRetrying } = useAsyncAction(async () => {
    await MentorSettingsService.retryModelLoad()
  })

  const confirmClearChats = () => {
    Alert.alert(
      MENTOR_AI_UI.settings.clearChatsTitle,
      MENTOR_AI_UI.settings.clearChatsBody,
      [
        { text: MENTOR_AI_UI.settings.cancel, style: 'cancel' },
        {
          text: MENTOR_AI_UI.settings.clearConfirm,
          style: 'destructive',
          onPress: () => {
            void MentorSettingsService.clearChatHistory().then(refreshStats)
          },
        },
      ],
    )
  }

  const confirmClearAll = () => {
    Alert.alert(
      MENTOR_AI_UI.settings.clearAllTitle,
      MENTOR_AI_UI.settings.clearAllBody,
      [
        { text: MENTOR_AI_UI.settings.cancel, style: 'cancel' },
        {
          text: MENTOR_AI_UI.settings.clearConfirm,
          style: 'destructive',
          onPress: () => {
            void MentorSettingsService.clearMentorData().then(refreshStats)
          },
        },
      ],
    )
  }

  return (
    <View className="gap-5 pb-8">
      <GameCard
        variant="reward"
        glow
        className={`gap-3 border ${tone.border} ${tone.bg}`}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
              {MENTOR_AI_UI.settings.engineTitle}
            </Text>
            <Text className={`mt-2 text-lg font-black ${tone.text}`}>
              {statusMeta.emoji} {statusMeta.label}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-foreground-secondary">
              {statusMeta.hint}
            </Text>
          </View>
          <Text className="text-3xl">{MENTOR_AI_UI.emoji}</Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-foreground-secondary">
              {runtime.modelLabel}
            </Text>
          </View>
          <View className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-foreground-secondary">
              {isNativeLoaded
                ? MENTOR_AI_UI.settings.nativeActive
                : MENTOR_AI_UI.settings.pedagogyActive}
            </Text>
          </View>
          <View className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-foreground-secondary">
              {MENTOR_AI_UI.settings.platformChip(Platform.OS)}
            </Text>
          </View>
        </View>

        {error ? (
          <Text className="text-xs leading-5 text-danger" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        {canRetry ? (
          <Button
            label={MENTOR_AI_UI.settings.retryLoad}
            onPress={() => void retryModel()}
            loading={isRetrying}
            loadingLabel={MENTOR_AI_UI.settings.retryLoading}
            variant="secondary"
          />
        ) : null}
      </GameCard>

      <GameCard variant="default" className="gap-3">
        <Text className="text-sm font-black uppercase tracking-widest text-muted">
          {MENTOR_AI_UI.settings.modelTitle}
        </Text>
        <View className="gap-2">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-sm text-foreground-secondary">
              {MENTOR_AI_UI.settings.modelNameLabel}
            </Text>
            <Text className="text-sm font-bold text-foreground">{MENTOR_LLM_MODEL_LABEL}</Text>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-sm text-foreground-secondary">
              {MENTOR_AI_UI.settings.modelFileLabel}
            </Text>
            <Text className="max-w-[58%] text-right text-xs font-medium text-foreground" numberOfLines={2}>
              {MENTOR_MODEL_FILENAME}
            </Text>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-sm text-foreground-secondary">
              {MENTOR_AI_UI.settings.modelSizeLabel}
            </Text>
            <Text className="text-sm font-bold text-foreground">~1 GB</Text>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-sm text-foreground-secondary">
              {MENTOR_AI_UI.settings.modelSourceLabel}
            </Text>
            <Text className="max-w-[58%] text-right text-xs text-muted" numberOfLines={2}>
              {MENTOR_MODEL_HF_REPO}
            </Text>
          </View>
          {modelPath ? (
            <View className="rounded-xl border border-border/60 bg-background/40 px-3 py-2">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {MENTOR_AI_UI.settings.modelPathLabel}
              </Text>
              <Text className="mt-1 text-xs leading-5 text-foreground-secondary">
                {shortenPath(modelPath)}
              </Text>
            </View>
          ) : null}
        </View>
      </GameCard>

      <View className="gap-3">
        <LearningSectionHeader
          emoji="🔒"
          title={MENTOR_AI_UI.settings.privacyTitle}
          hint={MENTOR_AI_UI.settings.privacyHint}
        />

        <GameCard variant="default" className="gap-3">
          <PressableScale
            onPress={() => router.push(routes.mentor.history as Href)}
            accessibilityRole="button"
            accessibilityLabel={MENTOR_AI_UI.shortcuts.history.label}
            className="flex-row items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
            <Text className="text-xl">{MENTOR_AI_UI.shortcuts.history.emoji}</Text>
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-bold text-foreground">
                {MENTOR_AI_UI.shortcuts.history.label}
              </Text>
              <Text className="text-xs text-foreground-secondary">
                {MENTOR_AI_UI.shortcuts.history.description}
              </Text>
            </View>
            <Text className="text-lg text-muted">›</Text>
          </PressableScale>

          {stats ? (
            <View className="flex-row flex-wrap gap-2">
              <View className="min-w-[30%] flex-1 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
                <Text className="text-lg font-black text-foreground">{stats.chatSessions}</Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {MENTOR_AI_UI.settings.statChats}
                </Text>
              </View>
              <View className="min-w-[30%] flex-1 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
                <Text className="text-lg font-black text-foreground">{stats.errorLogs}</Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {MENTOR_AI_UI.settings.statErrors}
                </Text>
              </View>
              <View className="min-w-[30%] flex-1 rounded-xl border border-border/60 bg-background/40 px-3 py-2">
                <Text className="text-lg font-black text-foreground">{stats.memoryEntries}</Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {MENTOR_AI_UI.settings.statMemory}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="gap-2 border-t border-border/50 pt-3">
            <Text className="text-sm font-bold text-foreground">
              {MENTOR_AI_UI.settings.retentionTitle}
            </Text>
            <Text className="text-xs leading-5 text-foreground-secondary">
              {MENTOR_AI_UI.settings.retentionHint}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {MENTOR_RETENTION_DAY_OPTIONS.map((days) => {
                const isActive = retention?.enabled && retention.retentionDays === days
                return (
                  <PressableScale
                    key={days}
                    onPress={() => void handleRetentionDays(days)}
                    accessibilityRole="button"
                    accessibilityLabel={MENTOR_AI_UI.settings.retentionDaysLabel(days)}
                    className={`rounded-full border px-2.5 py-1 ${
                      isActive
                        ? 'border-accent/50 bg-accent/15'
                        : 'border-border/60 bg-background/40'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        isActive ? 'text-accent' : 'text-foreground-secondary'
                      }`}>
                      {MENTOR_AI_UI.settings.retentionDaysLabel(days)}
                    </Text>
                  </PressableScale>
                )
              })}
              <PressableScale
                onPress={() => void handleRetentionDisable()}
                accessibilityRole="button"
                accessibilityLabel={MENTOR_AI_UI.settings.retentionDisabled}
                className={`rounded-full border px-2.5 py-1 ${
                  retention && !retention.enabled
                    ? 'border-accent/50 bg-accent/15'
                    : 'border-border/60 bg-background/40'
                }`}>
                <Text
                  className={`text-xs font-bold ${
                    retention && !retention.enabled ? 'text-accent' : 'text-foreground-secondary'
                  }`}>
                  {MENTOR_AI_UI.settings.retentionDisabled}
                </Text>
              </PressableScale>
            </View>

            <Button
              label={MENTOR_AI_UI.settings.retentionRunNow}
              variant="ghost"
              onPress={() => void runRetentionNow()}
              loading={isRunningRetention}
              loadingLabel={MENTOR_AI_UI.settings.retentionRunning}
              disabled={!retention?.enabled}
            />

            {lastPruneSummary ? (
              <Text className="text-xs text-muted">
                {MENTOR_AI_UI.settings.retentionLastRun(lastPruneSummary)}
              </Text>
            ) : null}
          </View>

          <Button
            label={MENTOR_AI_UI.settings.clearChats}
            variant="secondary"
            onPress={confirmClearChats}
            disabled={!stats || stats.chatSessions === 0}
          />
          <Button
            label={MENTOR_AI_UI.settings.clearAll}
            variant="danger"
            onPress={confirmClearAll}
            disabled={!stats || (stats.chatSessions === 0 && stats.errorLogs === 0 && stats.memoryEntries === 0)}
          />
        </GameCard>
      </View>

      <GameCard variant="default" className="gap-2">
        <PressableScale
          onPress={() => setShowDevSteps((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={MENTOR_AI_UI.settings.devTitle}
          className="flex-row items-center justify-between">
          <Text className="text-sm font-black text-foreground">
            {MENTOR_AI_UI.settings.devTitle}
          </Text>
          <Text className="text-lg text-muted">{showDevSteps ? '▾' : '›'}</Text>
        </PressableScale>

        {showDevSteps ? (
          <View className="gap-2 border-t border-border/50 pt-3">
            <Text className="text-sm leading-6 text-foreground-secondary">
              {MENTOR_AI_UI.settings.devIntro}
            </Text>
            {MENTOR_AI_UI.settings.devSteps.map((step, index) => (
              <View
                key={step}
                className="flex-row gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2">
                <Text className="text-xs font-black text-accent">{index + 1}</Text>
                <Text className="flex-1 font-mono text-xs leading-5 text-foreground-secondary">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </GameCard>

      <Text className="text-center text-[11px] leading-5 text-muted">
        {MENTOR_AI_UI.settings.footerNote}
      </Text>
    </View>
  )
}
