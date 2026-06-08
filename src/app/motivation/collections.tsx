import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MotivationCollectionsScreenContent } from '@/features/motivation-spark/components/MotivationCollectionsScreenContent'
import { MOTIVATION_UI } from '@/features/motivation-spark/constants/motivation-ui'

export default function MotivationCollectionsRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MOTIVATION_UI.collections.title}
        subtitle={MOTIVATION_UI.collections.subtitle}
        emoji={MOTIVATION_UI.collections.emoji}
      />
      <MotivationCollectionsScreenContent />
    </ScreenContainer>
  )
}
