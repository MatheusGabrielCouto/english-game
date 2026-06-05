import { View } from 'react-native'

import type { LearningDifficultyValue } from '@/features/game-design/constants/difficulty'

import { ProfilePersonalizationSection } from './ProfilePersonalizationSection'
import { ProfileSettingsHub } from './ProfileSettingsHub'

type ProfileSettingsTabContentProps = {
  difficulty: LearningDifficultyValue
  onDifficultyChange: (value: LearningDifficultyValue) => void
}

export const ProfileSettingsTabContent = ({
  difficulty,
  onDifficultyChange,
}: ProfileSettingsTabContentProps) => (
  <View className="gap-4">
    <ProfilePersonalizationSection />
    <ProfileSettingsHub difficulty={difficulty} onDifficultyChange={onDifficultyChange} />
  </View>
)
