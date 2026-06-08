import { View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import type { LearningIntelligenceSnapshot, SkillLevelRecord } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningGpsIntelligenceSection } from './LearningGpsIntelligenceSection'
import { LearningGpsSkillBar } from './LearningGpsSkillBar'

type LearningGpsInsightsTabProps = {
  skills: SkillLevelRecord[]
  intelligence: LearningIntelligenceSnapshot
}

export const LearningGpsInsightsTab = ({ skills, intelligence }: LearningGpsInsightsTabProps) => (
  <View className="gap-6">
    <View className="gap-3">
      <HomeSectionLabel
        emoji="📊"
        title={LEARNING_GPS_UI.screen.skillsTitle}
        subtitle={LEARNING_GPS_UI.screen.skillsSubtitle}
        tone="gold"
      />
      <GameCard className="gap-3 border-border/80">
        {skills.map((skill) => (
          <LearningGpsSkillBar key={skill.skillKey} skill={skill} />
        ))}
      </GameCard>
    </View>

    <LearningGpsIntelligenceSection intelligence={intelligence} compact />
  </View>
)
