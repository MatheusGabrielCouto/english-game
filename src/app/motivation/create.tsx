import { type Href, router } from 'expo-router'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { motivationSparkHref } from '@/constants/routes'
import {
  MotivationSparkForm,
  MotivationSparkService,
  type MotivationSparkFormValues,
} from '@/features/motivation-spark'
import { MOTIVATION_UI } from '@/features/motivation-spark/constants/motivation-ui'

export default function MotivationCreateRoute() {
  const handleSubmit = async (input: MotivationSparkFormValues) => {
    const spark = await MotivationSparkService.create(input)
    router.replace(motivationSparkHref(spark.id) as Href)
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={MOTIVATION_UI.create.title}
        subtitle={MOTIVATION_UI.create.subtitle}
        emoji={MOTIVATION_UI.hub.emoji}
      />
      <MotivationSparkForm onSubmit={handleSubmit} />
    </ScreenContainer>
  )
}
