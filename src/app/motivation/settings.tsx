import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MotivationSettingsSection } from '@/features/motivation-spark/components/MotivationSettingsSection'
import { MOTIVATION_UI } from '@/features/motivation-spark/constants/motivation-ui'

export default function MotivationSettingsRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MOTIVATION_UI.settings.title}
        subtitle={MOTIVATION_UI.settings.subtitle}
        emoji={MOTIVATION_UI.settings.emoji}
      />
      <MotivationSettingsSection />
    </ScreenContainer>
  )
}
