import { ScreenContainer } from '@/components/layout'
import { MotivationHubScreenContent } from '@/features/motivation-spark'
import { MotivationHubScreenHeader } from '@/features/motivation-spark/components/MotivationHubScreenHeader'

export default function MotivationHubRoute() {
  return (
    <ScreenContainer scrollable>
      <MotivationHubScreenHeader />
      <MotivationHubScreenContent />
    </ScreenContainer>
  )
}
