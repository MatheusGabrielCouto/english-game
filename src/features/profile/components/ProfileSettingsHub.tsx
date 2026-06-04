import Constants from 'expo-constants'
import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { BackupRestoreSection } from '@/features/backup'
import { FocusSettingsSection } from '@/features/focus-mode/components/FocusSettingsSection'
import type { LearningDifficultyValue } from '@/features/game-design/constants/difficulty'
import {
    NotificationHistorySection,
    NotificationSettingsSection,
} from '@/features/notifications'
import { AudioSettingsSection } from '@/features/profile/components/AudioSettingsSection'
import { CompactDifficultySelector } from '@/features/profile/components/CompactDifficultySelector'
import { TutorialGuideCard } from '@/features/tutorial'

import { PROFILE_UI } from '../constants/profile-ui'
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection'

type ProfileSettingsHubProps = {
  difficulty: LearningDifficultyValue
  onDifficultyChange: (value: LearningDifficultyValue) => void
}

const SettingsLink = ({ label, hint, onPress }: { label: string; hint: string; onPress: () => void }) => (
  <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
    <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
      <View className="min-w-0 flex-1 pr-2">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="mt-0.5 text-xs text-foreground-secondary">{hint}</Text>
      </View>
      <Text className="text-primary">→</Text>
    </View>
  </PressableScale>
)

export const ProfileSettingsHub = ({ difficulty, onDifficultyChange }: ProfileSettingsHubProps) => {
  const version = Constants.expoConfig?.version ?? '1.0.0'

  return (
    <View className="gap-3">
      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.gameplay.title}
        emoji={PROFILE_UI.sections.gameplay.emoji}
        subtitle={PROFILE_UI.sections.gameplay.subtitle}
        defaultOpen>
        <CompactDifficultySelector value={difficulty} onChange={onDifficultyChange} />
        <SettingsLink
          label={PROFILE_UI.routinesLink}
          hint={PROFILE_UI.routinesLinkHint}
          onPress={() => router.push(routes.routines as Href)}
        />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.notifications.title}
        emoji={PROFILE_UI.sections.notifications.emoji}
        subtitle={PROFILE_UI.sections.notifications.subtitle}>
        <NotificationSettingsSection />
        <NotificationHistorySection />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.audio.title}
        emoji={PROFILE_UI.sections.audio.emoji}
        subtitle={PROFILE_UI.sections.audio.subtitle}>
        <AudioSettingsSection />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.appearance.title}
        emoji={PROFILE_UI.sections.appearance.emoji}
        subtitle={PROFILE_UI.sections.appearance.subtitle}>
        <View className="rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-sm font-semibold text-foreground">{PROFILE_UI.themeLabel}</Text>
          <Text className="mt-1 text-xs text-foreground-secondary">{PROFILE_UI.themeHint}</Text>
        </View>
        <FocusSettingsSection />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.backup.title}
        emoji={PROFILE_UI.sections.backup.emoji}
        subtitle={PROFILE_UI.sections.backup.subtitle}>
        <BackupRestoreSection />
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection
        title={PROFILE_UI.sections.account.title}
        emoji={PROFILE_UI.sections.account.emoji}
        subtitle={PROFILE_UI.sections.account.subtitle}>
        <View className="gap-2 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-sm font-semibold text-foreground">English Quest</Text>
          <Text className="text-xs text-foreground-secondary">
            {PROFILE_UI.versionLabel}: {version}
          </Text>
          <Text className="text-xs text-muted">{PROFILE_UI.aboutBody}</Text>
        </View>
      </ProfileCollapsibleSection>

      <TutorialGuideCard compact />
    </View>
  )
}
