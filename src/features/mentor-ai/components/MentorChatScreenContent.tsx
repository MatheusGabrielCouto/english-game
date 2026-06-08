import { useEffect, useRef } from 'react'
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    View,
    type ListRenderItem,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { useKeyboardInset } from '@/hooks/use-keyboard-inset'
import type { MentorChatMessage } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorChat } from '../hooks/use-mentor-chat'
import { useMentorGpsStudyLaunch } from '../hooks/use-mentor-gps-study-launch'
import { useMentorLlmStore } from '../store/mentor-llm-store'
import { stripMentorMarkdown } from '../utils/render-mentor-text'
import { MentorSpeakingComposer } from './MentorSpeakingComposer'
import { MentorChatMessageBubble } from './MentorChatMessageBubble'
import { MentorChatSuggestions } from './MentorChatSuggestions'
import { MentorChatTypingIndicator } from './MentorChatTypingIndicator'
import { MentorGpsStudyBanner } from './MentorGpsStudyBanner'

const StreamingBubble = ({ text }: { text: string }) => (
  <View className="max-w-[82%] self-start">
    <View className="rounded-2xl rounded-bl-sm bg-surface-elevated px-3 py-2">
      <Text className="text-[15px] leading-5 text-foreground">{stripMentorMarkdown(text)}</Text>
    </View>
  </View>
)

export const MentorChatScreenContent = () => {
  const gpsStudy = useMentorGpsStudyLaunch()
  const {
    messages,
    isGenerating,
    streamingText,
    hasHydrated,
    error,
    lastCapturedGoal,
    sendMessage,
    startNewSession,
  } = useMentorChat()
  const llmStatus = useMentorLlmStore((state) => state.status)
  const llmError = useMentorLlmStore((state) => state.error)
  const insets = useSafeAreaInsets()
  const keyboardInset = useKeyboardInset()

  const listRef = useRef<FlatList<MentorChatMessage>>(null)
  const keyboardVerticalOffset = insets.top + 56

  const scrollToLatest = (animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated })
    })
  }

  useEffect(() => {
    if (!hasHydrated) return
    scrollToLatest()
  }, [hasHydrated, messages.length, streamingText, isGenerating])

  useEffect(() => {
    if (keyboardInset <= 0) return
    scrollToLatest()
  }, [keyboardInset])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const showSub = Keyboard.addListener(showEvent, () => scrollToLatest())
    return () => showSub.remove()
  }, [])

  if (!hasHydrated) {
    return <HomeCardSkeleton />
  }

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
          <Text className="text-[10px] font-bold text-accent">
            {llmStatus === 'ready'
              ? MENTOR_AI_UI.chat.llmReady
              : llmStatus === 'copying' || llmStatus === 'loading'
                ? MENTOR_AI_UI.chat.llmPreparing
                : MENTOR_AI_UI.chat.llmFallback}
          </Text>
        </View>
        <Button
          label={MENTOR_AI_UI.chat.newSession}
          size="sm"
          variant="ghost"
          onPress={() => void startNewSession()}
          disabled={isGenerating}
        />
      </View>

      {messages.length <= 1 ? (
        <>
          {gpsStudy.active && gpsStudy.topic ? (
            <View className="mb-3 px-1">
              <Button
                label={`📋 ${gpsStudy.title}`}
                variant="secondary"
                onPress={() =>
                  void sendMessage(`Me ajude a estudar o plano do GPS: ${gpsStudy.topic}`)
                }
                disabled={isGenerating}
                accessibilityLabel={gpsStudy.title}
              />
            </View>
          ) : null}
          <MentorChatSuggestions
            disabled={isGenerating}
            onSelect={(text) => void sendMessage(text)}
          />
        </>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{ paddingBottom: 12, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        ListFooterComponent={
          isGenerating ? (
            <View className="mb-3 px-1">
              {streamingText ? (
                <StreamingBubble text={streamingText} />
              ) : (
                <MentorChatTypingIndicator />
              )}
            </View>
          ) : null
        }
      />

      {llmError && llmStatus !== 'ready' ? (
        <Text className="mb-2 px-1 text-xs text-muted">{llmError}</Text>
      ) : null}

      {error ? (
        <Text className="mb-2 px-1 text-xs text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {lastCapturedGoal ? (
        <Text className="mb-2 px-1 text-center text-xs leading-5 text-accent">
          {MENTOR_AI_UI.chat.goalCapturedNote(lastCapturedGoal)}
        </Text>
      ) : null}

      <View style={{ paddingBottom: composerBottomInset }}>
        <MentorSpeakingComposer
          isGenerating={isGenerating}
          onSend={(text, options) => void sendMessage(text, options)}
        />
      </View>
    </View>
  )

  const chatShell = (
    <View className="min-h-0 flex-1 gap-2" style={{ flex: 1, minHeight: 0 }}>
      <MentorGpsStudyBanner />
      {chatBody}
    </View>
  )

  if (Platform.OS === 'android') {
    return chatShell
  }

  return (
    <KeyboardAvoidingView
      className="min-h-0 flex-1"
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}>
      {chatShell}
    </KeyboardAvoidingView>
  )
}
