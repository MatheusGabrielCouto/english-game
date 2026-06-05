import { Text, TextInput, View } from 'react-native'

import { INPUT_PLACEHOLDER_COLOR } from '@/constants'
import { JournalEntryType, type JournalEntryTypeValue, type JournalStatsRecord } from '@/types/journal'

import { VAULT_UI } from '../../constants/vault-ui'
import { VaultEmptyState } from './VaultEmptyState'
import { VaultGlobalSearchTrigger } from './VaultGlobalSearchTrigger'
import { VaultHelpCard } from './VaultHelpCard'
import { VaultHeroCard } from './VaultHeroCard'
import { VaultHubNav } from '../VaultHubNav'
import { VaultQuickAction } from './VaultQuickAction'
import { VaultSectionHeader } from './VaultSectionHeader'

type VaultLibraryListHeaderProps = {
  hubLinkMode: 'tab' | 'stack'
  search: string
  onSearchChange: (value: string) => void
  stats: JournalStatsRecord | null
  dueReviewCount: number
  spaceFilterLabel?: string
  onClearSpaceFilter?: () => void
  isEmpty: boolean
  onOpenCreate: (type?: JournalEntryTypeValue) => void
}

export const VaultLibraryListHeader = ({
  hubLinkMode,
  search,
  onSearchChange,
  stats,
  dueReviewCount,
  spaceFilterLabel,
  onClearSpaceFilter,
  isEmpty,
  onOpenCreate,
}: VaultLibraryListHeaderProps) => (
  <View className="gap-5 pb-3">
    <VaultHubNav active="library" linkMode={hubLinkMode} />
    <VaultGlobalSearchTrigger query={search} />

    <VaultHeroCard
      stats={stats}
      dueReviewCount={dueReviewCount}
      spaceFilterLabel={spaceFilterLabel}
      onClearSpaceFilter={onClearSpaceFilter}
    />

    {isEmpty ? (
      <VaultEmptyState
        emoji="📓"
        title={VAULT_UI.emptyLibraryTitle}
        body={VAULT_UI.emptyLibraryBody}
        ctaLabel={VAULT_UI.emptyLibraryCta}
        onCta={() => onOpenCreate()}
      />
    ) : null}

    <VaultHelpCard seenKey="vault-library" body={VAULT_UI.howItWorksBody} />

    {!isEmpty ? (
      <>
        <View>
          <VaultSectionHeader
            emoji="✨"
            title={VAULT_UI.quickActionsTitle}
            hint="Escolha o formato — você organiza a área depois"
          />
          <View className="mt-3 flex-row flex-wrap gap-2">
            <VaultQuickAction
              emoji="📝"
              label={VAULT_UI.actionTextNote}
              hint={VAULT_UI.actionTextNoteHint}
              accent
              onPress={() => onOpenCreate(JournalEntryType.TEXT_NOTE)}
            />
            <VaultQuickAction
              emoji="🎙️"
              label={VAULT_UI.actionVoiceNote}
              hint={VAULT_UI.actionVoiceNoteHint}
              onPress={() => onOpenCreate(JournalEntryType.VOICE_NOTE)}
            />
            <VaultQuickAction
              emoji="⚡"
              label={VAULT_UI.actionQuickNote}
              hint={VAULT_UI.actionQuickNoteHint}
              onPress={() => onOpenCreate(JournalEntryType.QUICK_NOTE)}
            />
            <VaultQuickAction
              emoji="📐"
              label={VAULT_UI.actionGrammar}
              hint={VAULT_UI.actionGrammarHint}
              onPress={() => onOpenCreate(JournalEntryType.GRAMMAR_ENTRY)}
            />
          </View>
        </View>

        <View>
          <Text className="text-sm font-semibold text-foreground">{VAULT_UI.searchLabel}</Text>
          <Text className="text-xs text-foreground-secondary">{VAULT_UI.searchHint}</Text>
          <TextInput
            className="mt-2 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
            value={search}
            onChangeText={onSearchChange}
            placeholder={VAULT_UI.searchPlaceholder}
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            accessibilityLabel={VAULT_UI.searchPlaceholder}
          />
        </View>
      </>
    ) : null}
  </View>
)
