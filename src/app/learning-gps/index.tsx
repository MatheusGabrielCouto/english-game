import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { LearningGpsScreenContent } from '@/features/learning-gps/components/LearningGpsScreenContent'
import { LEARNING_GPS_UI } from '@/features/learning-gps/constants/learning-gps-ui'

export default function LearningGpsRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={LEARNING_GPS_UI.screen.title}
        subtitle={LEARNING_GPS_UI.screen.subtitle}
        emoji={LEARNING_GPS_UI.screen.emoji}
      />
      <LearningGpsScreenContent />
    </ScreenContainer>
  )
}
