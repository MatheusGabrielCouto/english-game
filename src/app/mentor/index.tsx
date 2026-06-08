import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MentorDashboardScreenContent } from '@/features/mentor-ai/components/MentorDashboardScreenContent'
import { MENTOR_AI_UI } from '@/features/mentor-ai/constants/mentor-ai-ui'

export default function MentorDashboardRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        className="mb-3"
        title={MENTOR_AI_UI.dashboard.title}
        subtitle={MENTOR_AI_UI.dashboard.subtitle}
        emoji={MENTOR_AI_UI.emoji}
      />
      <MentorDashboardScreenContent />
    </ScreenContainer>
  )
}
