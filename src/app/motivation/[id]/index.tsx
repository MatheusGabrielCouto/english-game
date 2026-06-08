import { useLocalSearchParams } from 'expo-router'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { MotivationSparkDetailContent } from '@/features/motivation-spark'
import { MOTIVATION_UI } from '@/features/motivation-spark/constants/motivation-ui'

export default function MotivationSparkDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const sparkId = typeof id === 'string' ? id : ''

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MOTIVATION_UI.detail.title}
        subtitle={MOTIVATION_UI.hub.subtitle}
        emoji={MOTIVATION_UI.hub.emoji}
      />
      {sparkId ? <MotivationSparkDetailContent sparkId={sparkId} /> : null}
    </ScreenContainer>
  )
}
