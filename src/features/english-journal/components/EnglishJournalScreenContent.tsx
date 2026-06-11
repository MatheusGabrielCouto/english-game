import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedList } from '@/components/ui';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE, VIRTUALIZED_LIST_THRESHOLD } from '@/constants';
import { routes, vaultEntryHref } from '@/constants';
import { JournalEntryType, type JournalEntryRecord, type JournalEntryTypeValue } from '@/types/journal';
import type { VaultSpaceKey } from '@/types/knowledge-vault';

import {
  buildVaultLibraryFilter,
  VAULT_LIBRARY_SEARCH_DEBOUNCE_MS,
} from '../constants/vault-library-filter-ui';
import { VAULT_UI } from '../constants/vault-ui';
import { runFocusRefreshIfNeeded } from '@/storage/startup-read-policy';

import { KnowledgeVaultService } from '../services/knowledge-vault-service';
import { useVaultEntriesStore } from '../store/vault-entries-store';
import { useVaultMetaStore } from '../store/vault-meta-store';
import {
  buildVaultLibraryListRows,
  countVaultLibraryEntryRows,
  type VaultLibraryListRow,
} from '../utils/vault-library-list-rows';
import { getSpaceLabel } from '../utils/vault-map-builder';
import { JournalEntryCard } from './JournalEntryCard';
import { JournalEntryFormModal } from './JournalEntryFormModal';
import { VaultLibraryListHeader } from './vault/VaultLibraryListHeader';
import { VaultSectionHeader } from './vault/VaultSectionHeader';

type EnglishJournalScreenContentProps = {
  hubLinkMode?: 'tab' | 'stack';
};

export const EnglishJournalScreenContent = ({ hubLinkMode = 'stack' }: EnglishJournalScreenContentProps) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ space?: string }>();
  const { entries, dueReviews, favorites, pinned, recent } = useVaultEntriesStore(
    useShallow((s) => ({
      entries: s.entries,
      dueReviews: s.dueReviews,
      favorites: s.favorites,
      pinned: s.pinned,
      recent: s.recent,
    })),
  );
  const stats = useVaultMetaStore((s) => s.stats);
  const isLoading = useVaultMetaStore((s) => s.isLoading);
  const refresh = useVaultMetaStore((s) => s.refresh);

  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<JournalEntryRecord | null>(null);
  const [initialType, setInitialType] = useState<JournalEntryTypeValue>(JournalEntryType.TEXT_NOTE);

  const spaceFilter = params.space as VaultSpaceKey | undefined;
  const isEmpty = !isLoading && entries.length === 0 && recent.length === 0 && !search.trim();
  const mainEntries = search.trim() ? entries : recent;

  const listRows = useMemo(
    () =>
      buildVaultLibraryListRows({
        dueReviews,
        pinned,
        mainEntries,
        favorites,
        includeFavorites: !isEmpty,
      }),
    [dueReviews, pinned, mainEntries, favorites, isEmpty],
  );

  const entryCount = countVaultLibraryEntryRows(listRows);
  const shouldVirtualize = entryCount > VIRTUALIZED_LIST_THRESHOLD;

  const searchRef = useRef(search);
  searchRef.current = search;

  const refreshLibrary = useCallback(
    (searchText?: string) => {
      void refresh(buildVaultLibraryFilter(spaceFilter, searchText ?? searchRef.current));
    },
    [refresh, spaceFilter],
  );

  useFocusEffect(
    useCallback(() => {
      runFocusRefreshIfNeeded(!isLoading && stats !== null, () => refreshLibrary(searchRef.current));
    }, [isLoading, refreshLibrary, stats]),
  );

  const skipSearchDebounceRef = useRef(true);
  useEffect(() => {
    if (skipSearchDebounceRef.current) {
      skipSearchDebounceRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      refreshLibrary(search);
    }, VAULT_LIBRARY_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, refreshLibrary]);

  const openCreate = useCallback((type: JournalEntryTypeValue = JournalEntryType.TEXT_NOTE) => {
    setEditing(null);
    setInitialType(type);
    setFormVisible(true);
  }, []);

  const openEntry = useCallback(
    (entry: JournalEntryRecord) => {
      router.push(vaultEntryHref(entry.id));
    },
    [router],
  );

  const handleReview = useCallback(
    async (id: string) => {
      await KnowledgeVaultService.completeReview(id);
      await refresh(buildVaultLibraryFilter(spaceFilter, search));
    },
    [refresh, search, spaceFilter],
  );

  const handleFavorite = useCallback(
    async (id: string) => {
      await KnowledgeVaultService.toggleFavorite(id);
      await refresh(buildVaultLibraryFilter(spaceFilter, search));
    },
    [refresh, search, spaceFilter],
  );

  const clearSpaceFilter = useCallback(() => {
    router.replace(routes.vault.library);
  }, [router]);

  const listHeader = useMemo(
    () => (
      <VaultLibraryListHeader
        hubLinkMode={hubLinkMode}
        search={search}
        onSearchChange={setSearch}
        stats={stats}
        dueReviewCount={dueReviews.length}
        spaceFilterLabel={spaceFilter ? getSpaceLabel(spaceFilter) : undefined}
        onClearSpaceFilter={spaceFilter ? clearSpaceFilter : undefined}
        isEmpty={isEmpty}
        onOpenCreate={openCreate}
      />
    ),
    [
      hubLinkMode,
      search,
      stats,
      dueReviews.length,
      spaceFilter,
      clearSpaceFilter,
      isEmpty,
      openCreate,
    ],
  );

  const renderListRow = useCallback(
    (row: VaultLibraryListRow) => {
      if (row.kind === 'section') {
        return (
          <VaultSectionHeader
            emoji={row.emoji}
            title={row.title}
            hint={row.hint}
            trailing={row.trailing}
          />
        );
      }

      return (
        <JournalEntryCard
          entry={row.entry}
          compact={row.compact}
          onPress={() => openEntry(row.entry)}
          onReview={row.showReview ? () => void handleReview(row.entry.id) : undefined}
          onToggleFavorite={() => void handleFavorite(row.entry.id)}
        />
      );
    },
    [handleFavorite, handleReview, openEntry],
  );

  const handleSaved = useCallback(() => {
    void refresh(buildVaultLibraryFilter(spaceFilter, search));
  }, [refresh, search, spaceFilter]);

  if (isLoading) {
    return <ScreenSkeleton variant="vault" listCount={6} className="gap-5 pb-6" />;
  }

  if (shouldVirtualize) {
    return (
      <>
        <VirtualizedList
          className="flex-1"
          data={listRows}
          estimatedItemSize={VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.journalEntry}
          keyExtractor={(row) => row.key}
          ListHeaderComponent={listHeader}
          ListFooterComponent={<View className="h-6" />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={(row) => renderListRow(row)}
          extraData={`${search}:${spaceFilter ?? 'all'}:${entryCount}`}
        />
        <JournalEntryFormModal
          visible={formVisible}
          editing={editing}
          initialType={initialType}
          defaultSpaceKey={spaceFilter}
          onClose={() => setFormVisible(false)}
          onSaved={handleSaved}
        />
      </>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-5 pb-6">
        {listHeader}
        {listRows.map((row) => (
          <View key={row.key}>{renderListRow(row)}</View>
        ))}
      </ScrollView>
      <JournalEntryFormModal
        visible={formVisible}
        editing={editing}
        initialType={initialType}
        defaultSpaceKey={spaceFilter}
        onClose={() => setFormVisible(false)}
        onSaved={handleSaved}
      />
    </>
  );
};
