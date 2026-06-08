import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MentorSettingsScreenContent } from '@/features/mentor-ai/components/MentorSettingsScreenContent'
import { MENTOR_AI_UI } from '@/features/mentor-ai/constants/mentor-ai-ui'

export default function MentorSettingsRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MENTOR_AI_UI.settings.title}
        subtitle={MENTOR_AI_UI.settings.subtitle}
        emoji="⚙️"
      />
      <MentorSettingsScreenContent />
    </ScreenContainer>
  )
}
