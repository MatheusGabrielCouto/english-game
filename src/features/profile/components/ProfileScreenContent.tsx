import { View } from 'react-native';

import { AvatarCustomizer } from '@/features/avatar';
import { BackupRestoreSection } from '@/features/backup';
import { FocusSettingsSection } from '@/features/focus-mode/components/FocusSettingsSection';
import type { LearningDifficultyValue } from '@/features/game-design/constants/difficulty';
import {
    NotificationHistorySection,
    NotificationSettingsSection,
} from '@/features/notifications';
import { AudioSettingsSection } from '@/features/profile/components/AudioSettingsSection';
import { RpgAttributesCard } from '@/features/rpg/components/RpgAttributesCard';
import { ShieldSection } from '@/features/shields';
import { StreakSection } from '@/features/streak';
import { TutorialGuideCard } from '@/features/tutorial';

import { PROFILE_UI } from '../constants/profile-ui';
import { CompactDifficultySelector } from './CompactDifficultySelector';
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection';
import { ProfileExploreGrid } from './ProfileExploreGrid';
import { ProfilePlayerStrip } from './ProfilePlayerStrip';
import { ProfileQuickStats } from './ProfileQuickStats';

type ProfileScreenContentProps = {
  difficulty: LearningDifficultyValue;
  onDifficultyChange: (value: LearningDifficultyValue) => void;
  onEditName: () => void;
};

export const ProfileScreenContent = ({
  difficulty,
  onDifficultyChange,
  onEditName,
}: ProfileScreenContentProps) => {
  return (
    <View className="gap-3 pb-6">
      <ProfilePlayerStrip onEditName={onEditName} />
      <ProfileQuickStats />

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.explore.title}
        emoji={PROFILE_UI.sections.explore.emoji}
        subtitle={PROFILE_UI.sections.explore.subtitle}
        defaultOpen>
        <ProfileExploreGrid />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.character.title}
        emoji={PROFILE_UI.sections.character.emoji}
        subtitle={PROFILE_UI.sections.character.subtitle}>
        <CompactDifficultySelector value={difficulty} onChange={onDifficultyChange} />
        <AvatarCustomizer />
        <RpgAttributesCard />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.progress.title}
        emoji={PROFILE_UI.sections.progress.emoji}
        subtitle={PROFILE_UI.sections.progress.subtitle}>
        <StreakSection />
        <ShieldSection />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.system.title}
        emoji={PROFILE_UI.sections.system.emoji}
        subtitle={PROFILE_UI.sections.system.subtitle}>
        <AudioSettingsSection />
        <FocusSettingsSection />
        <NotificationSettingsSection />
        <NotificationHistorySection />
        <BackupRestoreSection />
      </ProfileCollapsibleSection>

      <TutorialGuideCard compact />
    </View>
  );
};
