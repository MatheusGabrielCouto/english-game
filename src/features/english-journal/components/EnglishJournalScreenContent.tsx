import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { routes, theme } from '@/constants';
import { JournalEntryType, type JournalEntryRecord, type JournalEntryTypeValue } from '@/types/journal';
import type { VaultSpaceKey } from '@/types/knowledge-vault';

import { VAULT_UI } from '../constants/vault-ui';
import { KnowledgeVaultService } from '../services/knowledge-vault-service';
import { useEnglishJournalStore } from '../store/english-journal-store';
import { getSpaceLabel } from '../utils/vault-map-builder';
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton';

import { JournalEntryCard } from './JournalEntryCard';
import { JournalEntryFormModal } from './JournalEntryFormModal';
import { VaultEmptyState } from './vault/VaultEmptyState';
import { VaultHelpCard } from './vault/VaultHelpCard';
import { VaultHeroCard } from './vault/VaultHeroCard';
import { VaultQuickAction } from './vault/VaultQuickAction';
import { VaultSectionHeader } from './vault/VaultSectionHeader';
import { VaultHubNav } from './VaultHubNav';

type EnglishJournalScreenContentProps = {
  hubLinkMode?: 'tab' | 'stack';
};

export const EnglishJournalScreenContent = ({ hubLinkMode = 'stack' }: EnglishJournalScreenContentProps) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ space?: string }>();
  const entries = useEnglishJournalStore((s) => s.entries);
  const dueReviews = useEnglishJournalStore((s) => s.dueReviews);
  const favorites = useEnglishJournalStore((s) => s.favorites);
  const pinned = useEnglishJournalStore((s) => s.pinned);
  const recent = useEnglishJournalStore((s) => s.recent);
  const stats = useEnglishJournalStore((s) => s.stats);
  const isLoading = useEnglishJournalStore((s) => s.isLoading);
  const refresh = useEnglishJournalStore((s) => s.refresh);

  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<JournalEntryRecord | null>(null);
  const [initialType, setInitialType] = useState<JournalEntryTypeValue>(JournalEntryType.TEXT_NOTE);

  const spaceFilter = params.space as VaultSpaceKey | undefined;
  const isEmpty = !isLoading && entries.length === 0 && recent.length === 0 && !search.trim();

  useFocusEffect(
    useCallback(() => {
      void refresh({
        search: search.trim() || undefined,
        spaceKey: spaceFilter ?? 'all',
      });
    }, [refresh, search, spaceFilter]),
  );

  const openCreate = (type: JournalEntryTypeValue = JournalEntryType.TEXT_NOTE) => {
    setEditing(null);
    setInitialType(type);
    setFormVisible(true);
  };

  const openEntry = (entry: JournalEntryRecord) => {
    router.push(`/english-journal/entry/${entry.id}` as never);
  };

  const handleReview = useCallback(
    async (id: string) => {
      await KnowledgeVaultService.completeReview(id);
      await refresh(
        spaceFilter || search.trim()
          ? { search: search.trim() || undefined, spaceKey: spaceFilter ?? 'all' }
          : undefined,
      );
    },
    [refresh, search, spaceFilter],
  );

  const handleFavorite = useCallback(
    async (id: string) => {
      await KnowledgeVaultService.toggleFavorite(id);
      await refresh({
        search: search.trim() || undefined,
        spaceKey: spaceFilter ?? 'all',
      });
    },
    [refresh, search, spaceFilter],
  );

  const clearSpaceFilter = () => {
    router.replace(routes.englishJournal as never);
  };

  if (isLoading) {
    return (
      <View className="gap-4 pb-6">
        <View className="h-14 rounded-2xl border border-border bg-surface" />
        <HomeCardSkeleton variant="hero" />
        <View className="flex-row flex-wrap gap-2">
          <View className="h-24 min-w-[47%] flex-1 rounded-2xl bg-surface-elevated" />
          <View className="h-24 min-w-[47%] flex-1 rounded-2xl bg-surface-elevated" />
        </View>
        <HomeCardSkeleton />
        <View className="items-center py-4">
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="gap-5 pb-6">
      <VaultHubNav active="library" linkMode={hubLinkMode} />

      <VaultHeroCard
        stats={stats}
        dueReviewCount={dueReviews.length}
        spaceFilterLabel={spaceFilter ? getSpaceLabel(spaceFilter) : undefined}
        onClearSpaceFilter={spaceFilter ? clearSpaceFilter : undefined}
      />

      <VaultHelpCard body={VAULT_UI.howItWorksBody} defaultOpen={isEmpty} />

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
                onPress={() => openCreate(JournalEntryType.TEXT_NOTE)}
              />
              <VaultQuickAction
                emoji="🎙️"
                label={VAULT_UI.actionVoiceNote}
                hint={VAULT_UI.actionVoiceNoteHint}
                onPress={() => openCreate(JournalEntryType.VOICE_NOTE)}
              />
              <VaultQuickAction
                emoji="⚡"
                label={VAULT_UI.actionQuickNote}
                hint={VAULT_UI.actionQuickNoteHint}
                onPress={() => openCreate(JournalEntryType.QUICK_NOTE)}
              />
              <VaultQuickAction
                emoji="📐"
                label={VAULT_UI.actionGrammar}
                hint={VAULT_UI.actionGrammarHint}
                onPress={() => openCreate(JournalEntryType.GRAMMAR_ENTRY)}
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground">{VAULT_UI.searchLabel}</Text>
            <Text className="text-xs text-foreground-secondary">{VAULT_UI.searchHint}</Text>
            <TextInput
              className="mt-2 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
              value={search}
              onChangeText={setSearch}
              placeholder={VAULT_UI.searchPlaceholder}
              placeholderTextColor="#71717a"
              accessibilityLabel={VAULT_UI.searchPlaceholder}
            />
          </View>
        </>
      ) : null}

      {dueReviews.length > 0 ? (
        <View className="gap-3">
          <VaultSectionHeader
            emoji="🔔"
            title={VAULT_UI.sectionReviews}
            hint={VAULT_UI.sectionReviewsHint}
            trailing={String(dueReviews.length)}
          />
          {dueReviews.slice(0, 5).map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => openEntry(entry)}
              onReview={() => void handleReview(entry.id)}
              onToggleFavorite={() => void handleFavorite(entry.id)}
            />
          ))}
        </View>
      ) : null}

      {pinned.length > 0 ? (
        <View className="gap-3">
          <VaultSectionHeader
            emoji="📌"
            title={VAULT_UI.sectionPinned}
            hint={VAULT_UI.sectionPinnedHint}
          />
          {pinned.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => openEntry(entry)}
              onReview={() => void handleReview(entry.id)}
              onToggleFavorite={() => void handleFavorite(entry.id)}
            />
          ))}
        </View>
      ) : null}

      {isEmpty ? (
        <VaultEmptyState
          emoji="📓"
          title={VAULT_UI.emptyLibraryTitle}
          body={VAULT_UI.emptyLibraryBody}
          ctaLabel={VAULT_UI.emptyLibraryCta}
          onCta={() => openCreate()}
        />
      ) : (
        <View className="gap-3">
          <VaultSectionHeader emoji="🕐" title={VAULT_UI.sectionRecent} />
          {(search.trim() ? entries : recent).map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => openEntry(entry)}
              onToggleFavorite={() => void handleFavorite(entry.id)}
              onReview={() => void handleReview(entry.id)}
            />
          ))}
        </View>
      )}

      {favorites.length > 0 && !isEmpty ? (
        <View className="gap-3">
          <VaultSectionHeader emoji="⭐" title={VAULT_UI.sectionFavorites} />
          {favorites.slice(0, 4).map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              compact
              onPress={() => openEntry(entry)}
              onToggleFavorite={() => void handleFavorite(entry.id)}
            />
          ))}
        </View>
      ) : null}

      <JournalEntryFormModal
        visible={formVisible}
        editing={editing}
        initialType={initialType}
        defaultSpaceKey={spaceFilter}
        onClose={() => setFormVisible(false)}
        onSaved={() =>
          void refresh({
            search: search.trim() || undefined,
            spaceKey: spaceFilter ?? 'all',
          })
        }
      />
    </View>
  );
};
