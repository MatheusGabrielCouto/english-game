import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'

import { AppIcon } from '@/components/ui/AppIcon'
import { theme } from '@/constants'
import { INPUT_PLACEHOLDER_COLOR } from '@/constants/input-ui'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorChatComposerProps = {
  disabled?: boolean
  isGenerating?: boolean
  placeholder?: string
  inputA11y?: string
  onSend: (text: string) => void
}

const INPUT_CLASS =
  'max-h-32 min-h-[44px] flex-1 rounded-3xl border border-border/70 bg-surface px-4 py-2.5 text-[15px] text-foreground'

export const MentorChatComposer = ({
  disabled = false,
  isGenerating = false,
  placeholder = MENTOR_AI_UI.chat.inputPlaceholder,
  inputA11y = MENTOR_AI_UI.chat.inputA11y,
  onSend,
}: MentorChatComposerProps) => {
  const [draft, setDraft] = useState('')

  const canSend = !disabled && !isGenerating && draft.trim().length > 0

  const handleSend = () => {
    if (!canSend) return
    setDraft('')
    onSend(draft.trim())
  }

  return (
    <View className="flex-row items-end gap-2 px-1 pt-2">
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
        multiline
        editable={!disabled}
        className={INPUT_CLASS}
        accessibilityLabel={inputA11y}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend }}
        accessibilityLabel={MENTOR_AI_UI.chat.send}
        className={`h-11 w-11 items-center justify-center rounded-full ${
          canSend ? 'bg-primary active:opacity-80' : 'bg-primary/40'
        }`}>
        <AppIcon name="send" size={20} color={theme.colors.foreground} strokeWidth={2.2} />
      </Pressable>
    </View>
  )
}
