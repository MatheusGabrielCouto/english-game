import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Text, TextInput, View } from 'react-native'

import { Button, EmptyState } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import { INPUT_PLACEHOLDER_COLOR } from '@/constants/input-ui'
import { LearningSectionHeader } from '@/features/learning/components/ui'
import { useAsyncAction } from '@/hooks'
import { runFocusRefreshIfNeeded } from '@/storage/startup-read-policy'
import type { MentorChatSessionRecord, MentorErrorLogRecord } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { MentorExerciseService } from '../services/mentor-exercise-service'
import {
  MentorHistoryService,
  type MentorHistorySnapshot,
  type MentorMemoryEntryView,
} from '../services/mentor-history-service'
import { formatMentorErrorCategory } from '../utils/format-error-category'
import { formatMentorHistoryDate } from '../utils/format-mentor-history-date'
import { stripMentorMarkdown } from '../utils/render-mentor-text'

type HistoryTab = 'chats' | 'errors' | 'memory'

const INPUT_CLASS =
  'min-h-[44px] rounded-xl border bg-surface px-4 py-2.5 text-sm text-foreground'

const getSessionPreview = (session: MentorChatSessionRecord): string => {
  const lastUser = session.messages
    .slice()
    .reverse()
    .find((message) => message.role === 'user')

  if (lastUser) return stripMentorMarkdown(lastUser.content).slice(0, 120)

  const lastAssistant = session.messages
    .slice()
    .reverse()
    .find((message) => message.role === 'assistant')

  return lastAssistant
    ? stripMentorMarkdown(lastAssistant.content).slice(0, 120)
    : MENTOR_AI_UI.history.emptyChatPreview
}

const countUserMessages = (session: MentorChatSessionRecord): number =>
  session.messages.filter((message) => message.role === 'user').length

type MemorySectionProps = {
  emoji: string
  title: string
  hint: string
  entries: MentorMemoryEntryView[]
  placeholder: string
  suggestions: readonly string[]
  onAdd: (text: string) => Promise<void>
  onDelete: (key: string) => void
  readOnly?: boolean
}

const MemorySection = ({
  emoji,
  title,
  hint,
  entries,
  placeholder,
  suggestions,
  onAdd,
  onDelete,
  readOnly = false,
}: MemorySectionProps) => {
  const [draft, setDraft] = useState('')
  const { run: submit, isPending } = useAsyncAction(async () => {
    await onAdd(draft)
    setDraft('')
  })

  return (
    <View className="gap-2">
      <LearningSectionHeader emoji={emoji} title={title} hint={hint} />

      {entries.length === 0 ? (
        <Text className="text-sm text-muted">{MENTOR_AI_UI.history.emptyMemorySection}</Text>
      ) : (
        <View className="gap-2">
          {entries.map((entry) => (
            <View
              key={entry.key}
              className="flex-row items-start gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
              <View className="min-w-0 flex-1">
                <Text className="text-sm leading-5 text-foreground">{entry.value}</Text>
                <Text className="mt-1 text-[10px] text-muted">
                  {formatMentorHistoryDate(entry.updatedAt)}
                </Text>
              </View>
              <PressableScale
                onPress={() => onDelete(entry.key)}
                accessibilityRole="button"
                accessibilityLabel={MENTOR_AI_UI.history.deleteEntry}
                className="rounded-lg border border-border/60 px-2 py-1">
                <Text className="text-xs text-danger">✕</Text>
              </PressableScale>
            </View>
          ))}
        </View>
      )}

      {!readOnly ? (
        <View className="gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            className={`${INPUT_CLASS} ${formInputBorderClass}`}
            accessibilityLabel={placeholder}
          />
          <Button
            label={MENTOR_AI_UI.history.addEntry}
            variant="secondary"
            onPress={() => void submit()}
            loading={isPending}
            disabled={!draft.trim()}
          />
          <View className="flex-row flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <PressableScale
                key={suggestion}
                onPress={() => setDraft(suggestion)}
                accessibilityRole="button"
                accessibilityLabel={suggestion}
                className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1">
                <Text className="text-xs text-foreground-secondary">{suggestion}</Text>
              </PressableScale>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}

const isHistoryTab = (value: string | undefined): value is HistoryTab =>
  value === 'chats' || value === 'errors' || value === 'memory'

export const MentorHistoryScreenContent = () => {
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>()
  const [tab, setTab] = useState<HistoryTab>('chats')
  const [snapshot, setSnapshot] = useState<MentorHistorySnapshot | null>(null)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (isHistoryTab(tabParam)) {
      setTab(tabParam)
    }
  }, [tabParam])

  const refresh = useCallback(async () => {
    const next = await MentorHistoryService.loadSnapshot()
    setSnapshot(next)
  }, [])

  useFocusEffect(
    useCallback(() => {
      runFocusRefreshIfNeeded(snapshot !== null, refresh)
    }, [refresh, snapshot]),
  )

  const confirmDeleteSession = (session: MentorChatSessionRecord) => {
    Alert.alert(
      MENTOR_AI_UI.history.deleteChatTitle,
      MENTOR_AI_UI.history.deleteChatBody(session.title),
      [
        { text: MENTOR_AI_UI.history.cancel, style: 'cancel' },
        {
          text: MENTOR_AI_UI.history.deleteConfirm,
          style: 'destructive',
          onPress: () => {
            void MentorHistoryService.deleteChatSession(session.id).then(refresh)
          },
        },
      ],
    )
  }

  const confirmDeleteError = (entry: MentorErrorLogRecord) => {
    Alert.alert(MENTOR_AI_UI.history.deleteErrorTitle, MENTOR_AI_UI.history.deleteErrorBody, [
      { text: MENTOR_AI_UI.history.cancel, style: 'cancel' },
      {
        text: MENTOR_AI_UI.history.deleteConfirm,
        style: 'destructive',
        onPress: () => {
          void MentorHistoryService.deleteError(entry.id).then(refresh)
        },
      },
    ])
  }

  const confirmDeleteMemory = (entry: MentorMemoryEntryView) => {
    Alert.alert(MENTOR_AI_UI.history.deleteMemoryTitle, MENTOR_AI_UI.history.deleteMemoryBody, [
      { text: MENTOR_AI_UI.history.cancel, style: 'cancel' },
      {
        text: MENTOR_AI_UI.history.deleteConfirm,
        style: 'destructive',
        onPress: () => {
          void MentorHistoryService.deleteMemoryEntry(entry.key).then(refresh)
        },
      },
    ])
  }

  const handleOpenSession = async (sessionId: string) => {
    const opened = await MentorHistoryService.openChatSession(sessionId)
    if (opened) {
      router.push(routes.mentor.chat as Href)
    }
  }

  const topErrorCategories = snapshot
    ? Object.entries(snapshot.errorCategoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : []

  const { run: practiceErrors, isPending: isPracticingErrors } = useAsyncAction(async () => {
    if (!snapshot || snapshot.errors.length === 0) return

    const exerciseSet = await MentorExerciseService.generateFromErrors(snapshot.errors)
    if (exerciseSet) {
      router.push(routes.mentor.exercise as Href)
    }
  })

  return (
    <View className="gap-4 pb-8">
      <GameCard variant="default" className="gap-2">
        <Text className="text-sm leading-6 text-foreground-secondary">
          {MENTOR_AI_UI.history.intro}
        </Text>
      </GameCard>

      <View className="flex-row gap-2">
        {(['chats', 'errors', 'memory'] as const).map((key) => (
          <PressableScale
            key={key}
            onPress={() => setTab(key)}
            accessibilityRole="button"
            accessibilityLabel={MENTOR_AI_UI.history.tabs[key]}
            className={`flex-1 rounded-xl border px-2 py-2.5 ${
              tab === key
                ? 'border-accent/50 bg-accent/15'
                : 'border-border/60 bg-background/40'
            }`}>
            <Text
              className={`text-center text-xs font-bold ${
                tab === key ? 'text-accent' : 'text-foreground-secondary'
              }`}>
              {MENTOR_AI_UI.history.tabs[key]}
            </Text>
          </PressableScale>
        ))}
      </View>

      {tab === 'chats' ? (
        <View className="gap-3">
          {!snapshot || snapshot.sessions.length === 0 ? (
            <EmptyState
              variant="game"
              title={MENTOR_AI_UI.history.emptyChatsTitle}
              description={MENTOR_AI_UI.history.emptyChatsBody}
            />
          ) : (
            snapshot.sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id
              const userCount = countUserMessages(session)

              return (
                <GameCard key={session.id} variant="default" className="gap-2">
                  <PressableScale
                    onPress={() =>
                      setExpandedSessionId((current) =>
                        current === session.id ? null : session.id,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={session.title}
                    className="gap-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="flex-1 text-sm font-bold text-foreground">
                        {session.title}
                      </Text>
                      <Text className="text-[10px] text-muted">
                        {formatMentorHistoryDate(session.updatedAt)}
                      </Text>
                    </View>
                    <Text className="text-xs leading-5 text-foreground-secondary" numberOfLines={2}>
                      {getSessionPreview(session)}
                    </Text>
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
                      {MENTOR_AI_UI.history.messageCount(userCount)}
                    </Text>
                  </PressableScale>

                  {isExpanded ? (
                    <View className="gap-2 border-t border-border/50 pt-2">
                      {session.messages
                        .filter((message) => message.role !== 'system')
                        .slice(-6)
                        .map((message) => (
                          <View
                            key={message.id}
                            className={`rounded-xl px-3 py-2 ${
                              message.role === 'user'
                                ? 'self-end bg-accent/15'
                                : 'self-start bg-background/60'
                            }`}>
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
                              {message.role === 'user'
                                ? MENTOR_AI_UI.history.youLabel
                                : MENTOR_AI_UI.history.atlasLabel}
                            </Text>
                            <Text className="mt-0.5 text-xs leading-5 text-foreground-secondary">
                              {stripMentorMarkdown(message.content)}
                            </Text>
                          </View>
                        ))}
                    </View>
                  ) : null}

                  <View className="flex-row gap-2">
                    <Button
                      label={MENTOR_AI_UI.history.openChat}
                      variant="secondary"
                      onPress={() => void handleOpenSession(session.id)}
                      className="flex-1"
                    />
                    <PressableScale
                      onPress={() => confirmDeleteSession(session)}
                      accessibilityRole="button"
                      accessibilityLabel={MENTOR_AI_UI.history.deleteChat}
                      className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2">
                      <Text className="text-xs font-bold text-danger">
                        {MENTOR_AI_UI.history.deleteChat}
                      </Text>
                    </PressableScale>
                  </View>
                </GameCard>
              )
            })
          )}
        </View>
      ) : null}

      {tab === 'errors' ? (
        <View className="gap-3">
          {snapshot && snapshot.errors.length > 0 ? (
            <GameCard variant="reward" className="gap-3">
              <View>
                <Text className="text-sm font-bold text-foreground">
                  {MENTOR_AI_UI.history.practiceErrors}
                </Text>
                <Text className="mt-1 text-xs leading-5 text-foreground-secondary">
                  {MENTOR_AI_UI.history.practiceErrorsHint}
                </Text>
              </View>
              <Button
                label={MENTOR_AI_UI.history.practiceErrors}
                variant="secondary"
                onPress={() => void practiceErrors()}
                loading={isPracticingErrors}
                loadingLabel={MENTOR_AI_UI.history.practiceErrorsLoading}
              />
            </GameCard>
          ) : null}

          {topErrorCategories.length > 0 ? (
            <GameCard variant="default" className="gap-2">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {MENTOR_AI_UI.history.frequentErrorsTitle}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {topErrorCategories.map(([category, count]) => (
                  <View
                    key={category}
                    className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1">
                    <Text className="text-xs font-bold text-warning">
                      {formatMentorErrorCategory(category)} · {count}
                    </Text>
                  </View>
                ))}
              </View>
            </GameCard>
          ) : null}

          {!snapshot || snapshot.errors.length === 0 ? (
            <EmptyState
              variant="game"
              title={MENTOR_AI_UI.history.emptyErrorsTitle}
              description={MENTOR_AI_UI.history.emptyErrorsBody}
            />
          ) : (
            snapshot.errors.map((entry) => (
              <GameCard key={entry.id} variant="default" className="gap-2">
                <View className="flex-row items-center justify-between gap-2">
                  <View className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1">
                    <Text className="text-[10px] font-bold text-foreground-secondary">
                      {formatMentorErrorCategory(entry.category)}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-muted">
                    {formatMentorHistoryDate(entry.occurredAt)}
                  </Text>
                </View>
                <Text className="text-sm text-danger line-through">{entry.original}</Text>
                <Text className="text-sm font-semibold text-success">{entry.corrected}</Text>
                <PressableScale
                  onPress={() => confirmDeleteError(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={MENTOR_AI_UI.history.deleteError}
                  className="self-start rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-1">
                  <Text className="text-xs font-bold text-danger">
                    {MENTOR_AI_UI.history.deleteError}
                  </Text>
                </PressableScale>
              </GameCard>
            ))
          )}
        </View>
      ) : null}

      {tab === 'memory' ? (
        <GameCard variant="default" className="gap-5">
          <MemorySection
            emoji="🎯"
            title={MENTOR_AI_UI.history.goalsTitle}
            hint={MENTOR_AI_UI.history.goalsHint}
            entries={snapshot?.memory.goals ?? []}
            placeholder={MENTOR_AI_UI.history.goalPlaceholder}
            suggestions={MENTOR_AI_UI.history.goalSuggestions}
            onAdd={async (text) => {
              await MentorHistoryService.addGoal(text)
              await refresh()
            }}
            onDelete={(key) => {
              const entry = snapshot?.memory.goals.find((item) => item.key === key)
              if (entry) confirmDeleteMemory(entry)
            }}
          />

          <MemorySection
            emoji="⚙️"
            title={MENTOR_AI_UI.history.preferencesTitle}
            hint={MENTOR_AI_UI.history.preferencesHint}
            entries={snapshot?.memory.preferences ?? []}
            placeholder={MENTOR_AI_UI.history.preferencePlaceholder}
            suggestions={MENTOR_AI_UI.history.preferenceSuggestions}
            onAdd={async (text) => {
              await MentorHistoryService.addPreference(text)
              await refresh()
            }}
            onDelete={(key) => {
              const entry = snapshot?.memory.preferences.find((item) => item.key === key)
              if (entry) confirmDeleteMemory(entry)
            }}
          />

          <MemorySection
            emoji="📚"
            title={MENTOR_AI_UI.history.topicsTitle}
            hint={MENTOR_AI_UI.history.topicsHint}
            entries={snapshot?.memory.topics ?? []}
            placeholder=""
            suggestions={[]}
            onAdd={async () => {}}
            onDelete={(key) => {
              const entry = snapshot?.memory.topics.find((item) => item.key === key)
              if (entry) confirmDeleteMemory(entry)
            }}
            readOnly
          />
        </GameCard>
      ) : null}
    </View>
  )
}
