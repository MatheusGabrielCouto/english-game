import { useEffect } from 'react'
import { View } from 'react-native'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { useAppStore } from '@/features/app/store/app-store'

import { PROFILE_UI } from '../constants/profile-ui'
import { useProfileScreenStore } from '../store/profile-screen-store'
import { ProfileEditModal } from './ProfileEditModal'
import { ProfileScreenContent } from './ProfileScreenContent'

type ProfileScreenProps = {
  showBack?: boolean
  autoOpenEdit?: boolean
}

export const ProfileScreen = ({ showBack = false, autoOpenEdit = false }: ProfileScreenProps) => {
  const openEditModal = useProfileScreenStore((state) => state.openEditModal)
  const difficulty = useAppStore((state) => state.difficulty)
  const setDifficulty = useAppStore((state) => state.setDifficulty)

  useEffect(() => {
    if (autoOpenEdit) {
      openEditModal()
    }
  }, [autoOpenEdit, openEditModal])

  return (
    <View className="flex-1">
      <ScreenContainer scrollable>
        <ScreenHeader
          showBack={showBack}
          title={PROFILE_UI.screenTitle}
          subtitle={PROFILE_UI.screenSubtitle}
          emoji="👤"
        />
        <ProfileScreenContent
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onEditName={openEditModal}
        />
      </ScreenContainer>
      <ProfileEditModal />
    </View>
  )
}
