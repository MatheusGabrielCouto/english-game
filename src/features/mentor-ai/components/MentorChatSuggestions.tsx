import { Pressable, Text, View } from 'react-native'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorChatSuggestionsProps = {
  disabled?: boolean
  onSelect: (text: string) => void
}

export const MentorChatSuggestions = ({ disabled = false, onSelect }: MentorChatSuggestionsProps) => (
  <View className="mb-3 flex-row flex-wrap gap-2 px-1">
    {MENTOR_AI_UI.chat.suggestions.map((suggestion) => (
      <Pressable
        key={suggestion}
        onPress={() => onSelect(suggestion)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={suggestion}
        className="rounded-full border border-border/70 bg-surface px-3 py-1.5 active:opacity-80 disabled:opacity-50">
        <Text className="text-xs font-semibold text-foreground-secondary">{suggestion}</Text>
      </Pressable>
    ))}
  </View>
)
