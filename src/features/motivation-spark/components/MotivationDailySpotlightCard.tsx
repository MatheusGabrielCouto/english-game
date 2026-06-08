import { type Href, router } from 'expo-router'

import { motivationSparkHref } from '@/constants/routes'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { MotivationSparkSpotlightLayout } from './MotivationSparkSpotlightLayout'

type MotivationDailySpotlightCardProps = {
  spark: MotivationSparkRecord
}

export const MotivationDailySpotlightCard = ({ spark }: MotivationDailySpotlightCardProps) => {
  const handleOpen = () => {
    router.push(motivationSparkHref(spark.id) as Href)
  }

  return (
    <MotivationSparkSpotlightLayout
      spark={spark}
      onOpen={handleOpen}
      primaryCta={MOTIVATION_UI.hub.dailyOpenCta}
    />
  )
}
