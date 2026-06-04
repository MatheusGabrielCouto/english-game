import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { Button } from '@/components';
import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { GameCard } from '@/components/ui/game';
import { theme } from '@/constants';
import type { VaultEntryRecord, VaultReviewBundle } from '@/types/knowledge-vault';

import { JournalEntryBodyTranslation } from '@/features/english-journal/components/JournalEntryBodyTranslation';
import { JournalEntryFormModal } from '@/features/english-journal/components/JournalEntryFormModal';
import { JournalVoicePlayer } from '@/features/english-journal/components/JournalVoicePlayer';
import { JournalImportanceBadge } from '@/features/english-journal/components/vault/JournalImportanceBadge';
import { VaultSectionHeader } from '@/features/english-journal/components/vault/VaultSectionHeader';
import {
    JOURNAL_CATEGORY_LABELS,
    JOURNAL_ENTRY_TYPE_LABELS,
    JOURNAL_UI,
} from '@/features/english-journal/constants/journal-ui';
import { VAULT_UI } from '@/features/english-journal/constants/vault-ui';
import { KnowledgeVaultService } from '@/features/english-journal/services/knowledge-vault-service';
import { useEnglishJournalStore } from '@/features/english-journal/store/english-journal-store';
import {
    formatNextReviewLabel,
    isReviewDue,
} from '@/features/english-journal/utils/journal-review';
import { getSpaceLabel } from '@/features/english-journal/utils/vault-map-builder';

export default function VaultEntryDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const refresh = useEnglishJournalStore((s) => s.refresh);
  const [entry, setEntry] = useState<VaultEntryRecord | null>(null);
  const [reviewBundle, setReviewBundle] = useState<VaultReviewBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [justReviewed, setJustReviewed] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const row = await KnowledgeVaultService.getEntry(id);
    setEntry(row);
    setReviewBundle(row ? await KnowledgeVaultService.getReviewBundle(id) : null);
    if (row && !isReviewDue(row.nextReviewAt)) {
      setJustReviewed(false);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = () => {
    if (!entry || deleting) return;
    Alert.alert(VAULT_UI.deleteNote, VAULT_UI.deleteNoteConfirm, [
      { text: JOURNAL_UI.cancel, style: 'cancel' },
      {
        text: VAULT_UI.deleteNoteAction,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setDeleting(true);
            try {
              await KnowledgeVaultService.delete(entry.id);
              await refresh();
              router.back();
            } finally {
              setDeleting(false);
            }
          })();
        },
      },
    ]);
  };

  const handleReview = async () => {
    if (!id || reviewing) return;
    setReviewing(true);
    try {
      const updated = await KnowledgeVaultService.completeReview(id);
      setEntry(updated);
      setJustReviewed(true);
      setReviewBundle(await KnowledgeVaultService.getReviewBundle(id));
      await refresh();
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={theme.colors.primary} className="mt-20" />
      </ScreenContainer>
    );
  }

  if (!entry) {
    return (
      <ScreenContainer>
        <ScreenHeader showBack title="Nota" emoji="📓" />
        <Text className="mt-4 text-muted">Nota não encontrada.</Text>
      </ScreenContainer>
    );
  }

  const due = isReviewDue(entry.nextReviewAt);
  const showReviewBanner = due || justReviewed;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={entry.title}
        subtitle={`${getSpaceLabel(entry.spaceKey)} · ${JOURNAL_ENTRY_TYPE_LABELS[entry.entryType]}`}
        emoji="📓"
      />
      <View className="gap-4">
        {showReviewBanner ? (
          <GameCard
            className={
              justReviewed && !due
                ? 'border-success/40 bg-success/10 gap-2'
                : 'border-primary/40 bg-primary/10 gap-2'
            }>
            {justReviewed && !due ? (
              <>
                <Text className="text-sm font-bold text-success">{VAULT_UI.reviewSuccessTitle}</Text>
                <Text className="text-xs leading-5 text-foreground-secondary">
                  {VAULT_UI.reviewSuccessBody(formatNextReviewLabel(entry.nextReviewAt))}
                </Text>
                <Text className="text-[10px] text-muted">{VAULT_UI.reviewDoneHint}</Text>
              </>
            ) : (
              <>
                <Text className="text-sm font-bold text-primary">{VAULT_UI.reviewBanner(1)}</Text>
                {reviewBundle?.message ? (
                  <Text className="text-xs italic text-foreground-secondary">
                    {reviewBundle.message}
                  </Text>
                ) : null}
                <View className="mt-2">
                  <Button
                    label={VAULT_UI.reviewCta}
                    size="sm"
                    loading={reviewing}
                    onPress={() => void handleReview()}
                  />
                </View>
              </>
            )}
          </GameCard>
        ) : null}

        <GameCard className="gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <JournalImportanceBadge importance={entry.importance} />
            <Text className="text-xs text-muted">
              {JOURNAL_CATEGORY_LABELS[entry.category]}
              {entry.isPinned ? ` · ${VAULT_UI.pinnedKnowledge}` : ''}
            </Text>
          </View>
          {entry.audioUri ? (
            <JournalVoicePlayer
              entryId={entry.id}
              audioUri={entry.audioUri}
              durationMs={entry.audioDurationMs}
            />
          ) : null}
          {entry.body ? (
            <View className="gap-3">
              <Text className="text-base leading-6 text-foreground">{entry.body}</Text>
              <JournalEntryBodyTranslation body={entry.body} />
            </View>
          ) : entry.audioUri ? null : (
            <Text className="text-sm italic text-muted">Sem texto — pode ser uma nota de voz.</Text>
          )}
          {entry.tags.length > 0 ? (
            <Text className="text-sm text-primary">
              {entry.tags.map((t) => `#${t}`).join(' ')}
            </Text>
          ) : null}
          <View className="mt-2 flex-row flex-wrap gap-2">
            <Button
              label={VAULT_UI.editNote}
              size="sm"
              onPress={() => setFormVisible(true)}
            />
            <Button
              label={entry.isPinned ? VAULT_UI.unpinNote : VAULT_UI.pinNote}
              size="sm"
              variant="secondary"
              onPress={() => void KnowledgeVaultService.togglePin(entry.id).then(load)}
            />
            <Button
              label={VAULT_UI.deleteNote}
              size="sm"
              variant="secondary"
              loading={deleting}
              onPress={handleDelete}
            />
            {due && !justReviewed ? (
              <Button
                label={VAULT_UI.reviewCta}
                size="sm"
                loading={reviewing}
                onPress={() => void handleReview()}
              />
            ) : null}
          </View>
        </GameCard>

        <View>
          <VaultSectionHeader
            emoji="🔗"
            title={VAULT_UI.relatedKnowledge}
            hint={VAULT_UI.relatedKnowledgeHint}
          />
          <GameCard className="mt-2">
            {reviewBundle && reviewBundle.relatedEntries.length > 0 ? (
              <View className="gap-2">
                {reviewBundle.relatedEntries.map((related) => (
                  <Pressable
                    key={related.id}
                    onPress={() => router.push(`/english-journal/entry/${related.id}` as never)}
                    accessibilityRole="button"
                    accessibilityLabel={related.title}>
                    <Text className="text-sm font-medium text-primary">· {related.title}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text className="text-xs leading-5 text-foreground-secondary">{VAULT_UI.noRelated}</Text>
            )}
          </GameCard>
        </View>
      </View>

      <JournalEntryFormModal
        visible={formVisible}
        editing={entry}
        onClose={() => setFormVisible(false)}
        onSaved={() => {
          setFormVisible(false);
          void load();
        }}
      />
    </ScreenContainer>
  );
};
