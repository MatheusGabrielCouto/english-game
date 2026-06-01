import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { useAppStore } from '@/features/app/store/app-store';
import { ProfileEditModal, ProfileScreenContent, useProfileScreenStore } from '@/features/profile';
import { PROFILE_UI } from '@/features/profile/constants/profile-ui';

export default function ProfileScreen() {
  const openEditModal = useProfileScreenStore((state) => state.openEditModal);
  const difficulty = useAppStore((state) => state.difficulty);
  const setDifficulty = useAppStore((state) => state.setDifficulty);

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer scrollable>
        <ScreenHeader
          title={PROFILE_UI.screenTitle}
          subtitle="Conta, progresso e atalhos"
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
  );
}
