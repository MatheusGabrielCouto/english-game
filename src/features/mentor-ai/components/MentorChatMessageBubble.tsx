import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import { Alert, Pressable, Text, View } from 'react-native'

import type { MentorChatMessage } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { stripMentorMarkdown } from '../utils/render-mentor-text'

type MentorChatMessageBubbleProps = {
  message: MentorChatMessage
}

const formatTime = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export const MentorChatMessageBubble = ({ message }: MentorChatMessageBubbleProps) => {
  const isUser = message.role === 'user'
  const content = stripMentorMarkdown(message.content)
  const time = formatTime(message.createdAt)

  const handleCopy = async () => {
    await Clipboard.setStringAsync(content)
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const handleLongPress = () => {
    Alert.alert(MENTOR_AI_UI.chat.messageActionsTitle, undefined, [
      {
        text: MENTOR_AI_UI.chat.copyMessage,
        onPress: () => void handleCopy(),
      },
      { text: MENTOR_AI_UI.chat.cancelAction, style: 'cancel' },
    ])
  }

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={280}
      accessibilityRole="button"
      accessibilityLabel={`${isUser ? 'Sua mensagem' : 'Mensagem do Atlas'}: ${content}`}
      accessibilityHint={MENTOR_AI_UI.chat.copyHint}
      className={`max-w-[82%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={
          isUser
            ? 'rounded-2xl rounded-br-sm bg-primary px-3 py-2'
            : 'rounded-2xl rounded-bl-sm bg-surface-elevated px-3 py-2'
        }>
        <Text className={`text-[15px] leading-5 ${isUser ? 'text-white' : 'text-foreground'}`}>
          {content}
        </Text>
        {time ? (
          <Text
            className={`mt-1 self-end text-[10px] ${isUser ? 'text-white/60' : 'text-muted'}`}>
            {time}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
}
