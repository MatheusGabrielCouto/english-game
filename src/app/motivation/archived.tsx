import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MotivationArchivedScreenContent } from '@/features/motivation-spark/components/MotivationArchivedScreenContent'
import { MOTIVATION_UI } from '@/features/motivation-spark/constants/motivation-ui'

export default function MotivationArchivedRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MOTIVATION_UI.archived.title}
        subtitle={MOTIVATION_UI.archived.subtitle}
        emoji={MOTIVATION_UI.archived.emoji}
      />
      <MotivationArchivedScreenContent />
    </ScreenContainer>
  )
}
