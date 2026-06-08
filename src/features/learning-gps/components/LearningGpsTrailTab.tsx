import { View } from 'react-native'

import type {
    LearningCurriculumSnapshot,
    LearningWorldKeyValue,
    LearningWorldRecord,
    PlayerLearningProfileRecord,
} from '@/types/learning-gps'

import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningCurriculumSection } from './LearningCurriculumSection'
import { LearningGpsWorldsStepper } from './LearningGpsWorldsStepper'

type LearningGpsTrailTabProps = {
  curriculum: LearningCurriculumSnapshot | null
  worldName: string
  worldEmoji: string
  worlds: LearningWorldRecord[]
  currentWorld: LearningWorldRecord
  profile: PlayerLearningProfileRecord
  unlockedWorldKeys: LearningWorldKeyValue[]
  completedWorldKeys: LearningWorldKeyValue[]
  onUpdated?: () => void
}

export const LearningGpsTrailTab = ({
  curriculum,
  worldName,
  worldEmoji,
  worlds,
  currentWorld,
  profile,
  unlockedWorldKeys,
  completedWorldKeys,
  onUpdated,
}: LearningGpsTrailTabProps) => (
  <View className="gap-6">
    {curriculum ? (
      <LearningCurriculumSection
        curriculum={curriculum}
        worldName={worldName}
        worldEmoji={worldEmoji}
        onUpdated={onUpdated}
      />
    ) : null}

    <View className="gap-3">
      <HomeSectionLabel
        emoji="🗺️"
        title={LEARNING_GPS_UI.screen.worldsTitle}
        subtitle={LEARNING_GPS_UI.screen.worldsSubtitle}
        tone="primary"
      />
      <LearningGpsWorldsStepper
        worlds={worlds}
        currentWorld={currentWorld}
        profile={profile}
        unlockedWorldKeys={unlockedWorldKeys}
        completedWorldKeys={completedWorldKeys}
      />
    </View>
  </View>
)
