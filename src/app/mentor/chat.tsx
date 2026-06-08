import { View } from 'react-native'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MentorChatScreenContent } from '@/features/mentor-ai/components/MentorChatScreenContent'
import { MENTOR_AI_UI } from '@/features/mentor-ai/constants/mentor-ai-ui'

export default function MentorChatRoute() {
  return (
    <ScreenContainer
      className="flex-1"
      contentClassName="min-h-0 flex-1 px-4 pb-0"
      edges={['top', 'left', 'right']}>
      <ScreenHeader
        showBack
        title={MENTOR_AI_UI.chat.title}
        subtitle={MENTOR_AI_UI.chat.subtitle}
        emoji="💬"
      />
      <View className="min-h-0 flex-1" style={{ flex: 1, minHeight: 0 }}>
        <MentorChatScreenContent />
      </View>
    </ScreenContainer>
  )
}
