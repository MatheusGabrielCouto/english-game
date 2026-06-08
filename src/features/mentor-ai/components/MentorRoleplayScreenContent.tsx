import { useEffect, useRef, useState } from 'react'
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
    type ListRenderItem,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import { useKeyboardInset } from '@/hooks/use-keyboard-inset'
import { MentorRoleplayMode, type MentorChatMessage } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import {
    MENTOR_INTERVIEW_TRACKS,
    MENTOR_ROLEPLAY_MIN_TURNS,
    MENTOR_ROLEPLAY_ROLES,
} from '../constants/mentor-roleplay-catalog'
import { useMentorGpsStudyLaunch } from '../hooks/use-mentor-gps-study-launch'
import { useMentorRoleplay } from '../hooks/use-mentor-roleplay'
import { useMentorLlmStore } from '../store/mentor-llm-store'
import { stripMentorMarkdown } from '../utils/render-mentor-text'
import { MentorSpeakingComposer } from './MentorSpeakingComposer'
import { MentorChatMessageBubble } from './MentorChatMessageBubble'
import { MentorChatTypingIndicator } from './MentorChatTypingIndicator'
import { MentorGpsStudyBanner } from './MentorGpsStudyBanner'
import { MentorRoleplayFeedbackCard } from './MentorRoleplayFeedbackCard'

type PickerTab = 'conversation' | 'interview'

const StreamingBubble = ({ text }: { text: string }) => (
  <View className="max-w-[82%] self-start">
    <View className="rounded-2xl rounded-bl-sm bg-surface-elevated px-3 py-2">
      <Text className="text-[15px] leading-5 text-foreground">{stripMentorMarkdown(text)}</Text>
    </View>
  </View>
)

export const MentorRoleplayScreenContent = () => {
  useMentorGpsStudyLaunch()
  const roleplay = useMentorRoleplay()
  const llmStatus = useMentorLlmStore((state) => state.status)
  const insets = useSafeAreaInsets()
  const keyboardInset = useKeyboardInset()
  const [pickerTab, setPickerTab] = useState<PickerTab>('conversation')

  const listRef = useRef<FlatList<MentorChatMessage>>(null)
  const keyboardVerticalOffset = insets.top + 56

  const scrollToLatest = (animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated })
    })
  }

  useEffect(() => {
    if (roleplay.phase !== 'active') return
    scrollToLatest()
  }, [roleplay.phase, roleplay.messages.length, roleplay.streamingText, roleplay.isGenerating])

  useEffect(() => {
    if (keyboardInset <= 0 || roleplay.phase !== 'active') return
    scrollToLatest()
  }, [keyboardInset, roleplay.phase])

  useEffect(() => {
    if (roleplay.phase !== 'active') return
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const showSub = Keyboard.addListener(showEvent, () => scrollToLatest())
    return () => showSub.remove()
  }, [roleplay.phase])

  if (roleplay.phase === 'feedback' && roleplay.feedback) {
    return (
      <ScrollView className="flex-1" contentContainerClassName="gap-4 pb-6">
        <MentorGpsStudyBanner />
        <MentorRoleplayFeedbackCard
          feedback={roleplay.feedback}
          showTechnical={roleplay.mode === MentorRoleplayMode.INTERVIEW}
        />
        <Button label={MENTOR_AI_UI.roleplay.newSession} onPress={roleplay.backToPicker} />
      </ScrollView>
    )
  }

  if (roleplay.phase === 'active') {
    const canFinish = roleplay.turnCount >= 1
    const turnsHint = MENTOR_AI_UI.roleplay.turnsProgress(
      roleplay.turnCount,
      MENTOR_ROLEPLAY_MIN_TURNS,
    )

    const renderItem: ListRenderItem<MentorChatMessage> = ({ item }) => (
      <View className="mb-3 px-1">
        <MentorChatMessageBubble message={item} />
      </View>
    )

    const composerBottomInset =
      Platform.OS === 'android'
        ? keyboardInset > 0
          ? keyboardInset
          : Math.max(insets.bottom, 8)
        : Math.max(insets.bottom, 8)

    const chatBody = (
      <View className="min-h-0 flex-1" style={{ flex: 1, minHeight: 0 }}>
        <View className="mb-3 flex-row items-center justify-between gap-2 px-1">
          <View className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-accent">{turnsHint}</Text>
          </View>
          <Button
            label={MENTOR_AI_UI.roleplay.finish}
            size="sm"
            variant="ghost"
            onPress={() => void roleplay.finishSession()}
            disabled={!canFinish || roleplay.isGenerating}
            loading={roleplay.isGenerating && roleplay.messages.length > 0}
            loadingLabel={MENTOR_AI_UI.roleplay.generatingFeedback}
          />
        </View>

        <FlatList
          ref={listRef}
          data={roleplay.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          className="min-h-0 flex-1"
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            roleplay.isGenerating ? (
              <View className="px-1 pb-2">
                {roleplay.streamingText ? (
                  <StreamingBubble text={roleplay.streamingText} />
                ) : (
                  <MentorChatTypingIndicator />
                )}
              </View>
            ) : null
          }
        />

        {roleplay.error ? (
          <Text className="px-1 text-sm text-danger" accessibilityRole="alert">
            {roleplay.error}
          </Text>
        ) : null}

        <View style={{ paddingBottom: composerBottomInset }}>
          <MentorSpeakingComposer
            disabled={roleplay.isGenerating}
            isGenerating={roleplay.isGenerating}
            placeholder={MENTOR_AI_UI.roleplay.inputPlaceholder}
            inputA11y={MENTOR_AI_UI.roleplay.inputA11y}
            onSend={(text, options) => void roleplay.sendMessage(text, options)}
          />
        </View>
      </View>
    )

    const activeShell = (
      <View className="min-h-0 flex-1" style={{ flex: 1, minHeight: 0 }}>
        {chatBody}
      </View>
    )

    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView
          className="min-h-0 flex-1"
          style={{ flex: 1, minHeight: 0 }}
          behavior="padding"
          keyboardVerticalOffset={keyboardVerticalOffset}>
          {activeShell}
        </KeyboardAvoidingView>
      )
    }

    return activeShell
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 pb-6">
      <MentorGpsStudyBanner />
      <GameCard variant="default" className="gap-3">
        <Text className="text-sm leading-6 text-foreground-secondary">
          {MENTOR_AI_UI.roleplay.intro}
        </Text>
        <View className="self-start rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1">
          <Text className="text-[10px] font-bold text-accent">
            {llmStatus === 'ready'
              ? MENTOR_AI_UI.chat.llmReady
              : MENTOR_AI_UI.roleplay.offlineEngine}
          </Text>
        </View>
      </GameCard>

      <View className="flex-row gap-2">
        {(['conversation', 'interview'] as const).map((key) => (
          <PressableScale
            key={key}
            onPress={() => setPickerTab(key)}
            accessibilityRole="button"
            accessibilityLabel={MENTOR_AI_UI.roleplay.tabs[key]}
            accessibilityState={{ selected: pickerTab === key }}
            className={`flex-1 rounded-xl border px-3 py-2.5 ${
              pickerTab === key ? 'border-accent bg-accent/15' : 'border-border/70 bg-background/60'
            }`}>
            <Text
              className={`text-center text-xs font-bold ${
                pickerTab === key ? 'text-accent' : 'text-foreground-secondary'
              }`}>
              {MENTOR_AI_UI.roleplay.tabs[key]}
            </Text>
          </PressableScale>
        ))}
      </View>

      {pickerTab === 'conversation' ? (
        <View className="gap-2">
          <Text className="text-[10px] font-black uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.roleplay.pickRole}
          </Text>
          {MENTOR_ROLEPLAY_ROLES.map((option) => (
            <PressableScale
              key={option.id}
              onPress={() => void roleplay.startConversation(option.id)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
              <Text className="text-xl">{option.emoji}</Text>
              <Text className="mt-1 text-sm font-bold text-foreground">{option.label}</Text>
              <Text className="mt-0.5 text-xs text-foreground-secondary">{option.description}</Text>
            </PressableScale>
          ))}
        </View>
      ) : (
        <View className="gap-2">
          <Text className="text-[10px] font-black uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.roleplay.pickTrack}
          </Text>
          {MENTOR_INTERVIEW_TRACKS.map((option) => (
            <PressableScale
              key={option.id}
              onPress={() => void roleplay.startInterview(option.id)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
              <Text className="text-xl">{option.emoji}</Text>
              <Text className="mt-1 text-sm font-bold text-foreground">{option.label}</Text>
              <Text className="mt-0.5 text-xs text-foreground-secondary">{option.description}</Text>
            </PressableScale>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
