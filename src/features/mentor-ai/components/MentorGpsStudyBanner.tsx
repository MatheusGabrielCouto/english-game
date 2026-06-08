import { Text } from 'react-native'

import { GameCard } from '@/components/ui/game'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorGpsStudyStore } from '../store/mentor-gps-study-store'

export const MentorGpsStudyBanner = () => {
  const context = useMentorGpsStudyStore()

  if (!context.active || !context.title) return null

  return (
    <GameCard variant="default" className="gap-1 border-primary/30 bg-primary/5">
      <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
        {MENTOR_AI_UI.gpsStudy.bannerTitle}
      </Text>
      <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
        {context.title}
      </Text>
      {context.description ? (
        <Text className="text-xs leading-5 text-foreground-secondary" numberOfLines={2}>
          {context.description}
        </Text>
      ) : null}
      <Text className="text-[11px] leading-5 text-muted">{MENTOR_AI_UI.gpsStudy.bannerHint}</Text>
    </GameCard>
  )
}
