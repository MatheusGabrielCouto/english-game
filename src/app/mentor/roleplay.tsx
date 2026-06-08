import { View } from 'react-native'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MentorRoleplayScreenContent } from '@/features/mentor-ai/components/MentorRoleplayScreenContent'
import { MENTOR_AI_UI } from '@/features/mentor-ai/constants/mentor-ai-ui'

export default function MentorRoleplayRoute() {
  return (
    <ScreenContainer
      className="flex-1"
      contentClassName="min-h-0 flex-1 px-4 pb-0"
      edges={['top', 'left', 'right']}>
      <ScreenHeader
        showBack
        title={MENTOR_AI_UI.roleplay.title}
        subtitle={MENTOR_AI_UI.roleplay.subtitle}
        emoji="🎭"
      />
      <View className="min-h-0 flex-1" style={{ flex: 1, minHeight: 0 }}>
        <MentorRoleplayScreenContent />
      </View>
    </ScreenContainer>
  )
}
