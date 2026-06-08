import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MentorHistoryScreenContent } from '@/features/mentor-ai/components/MentorHistoryScreenContent'
import { MENTOR_AI_UI } from '@/features/mentor-ai/constants/mentor-ai-ui'

export default function MentorHistoryRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MENTOR_AI_UI.history.title}
        subtitle={MENTOR_AI_UI.history.subtitle}
        emoji="📜"
      />
      <MentorHistoryScreenContent />
    </ScreenContainer>
  )
}
