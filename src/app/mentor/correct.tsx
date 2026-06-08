import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MentorCorrectionScreenContent } from '@/features/mentor-ai/components/MentorCorrectionScreenContent'
import { MENTOR_AI_UI } from '@/features/mentor-ai/constants/mentor-ai-ui'

export default function MentorCorrectRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MENTOR_AI_UI.correct.title}
        subtitle={MENTOR_AI_UI.correct.subtitle}
        emoji="✏️"
      />
      <MentorCorrectionScreenContent />
    </ScreenContainer>
  )
}
