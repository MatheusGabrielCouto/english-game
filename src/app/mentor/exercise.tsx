import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MentorExerciseScreenContent } from '@/features/mentor-ai/components/MentorExerciseScreenContent'
import { MENTOR_AI_UI } from '@/features/mentor-ai/constants/mentor-ai-ui'

export default function MentorExerciseRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MENTOR_AI_UI.exercise.title}
        subtitle={MENTOR_AI_UI.exercise.subtitle}
        emoji="📝"
      />
      <MentorExerciseScreenContent />
    </ScreenContainer>
  )
}
