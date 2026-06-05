import { useState } from 'react'
import { View } from 'react-native'

import type { LearningDifficultyValue } from '@/features/game-design/constants/difficulty'

import type { ProfileTab } from '../constants/profile-ui'
import { ProfileIdentityTabContent } from './ProfileIdentityTabContent'
import { ProfileSettingsTabContent } from './ProfileSettingsTabContent'
import { ProfileTabSwitcher } from './ProfileTabSwitcher'

type ProfileScreenContentProps = {
  difficulty: LearningDifficultyValue
  onDifficultyChange: (value: LearningDifficultyValue) => void
  onEditName: () => void
}

export const ProfileScreenContent = ({
  difficulty,
  onDifficultyChange,
  onEditName,
}: ProfileScreenContentProps) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('identity')

  return (
    <View className="gap-4 pb-6">
      <ProfileTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'identity' ? (
        <ProfileIdentityTabContent onEditName={onEditName} />
      ) : (
        <ProfileSettingsTabContent
          difficulty={difficulty}
          onDifficultyChange={onDifficultyChange}
        />
      )}
    </View>
  )
}
