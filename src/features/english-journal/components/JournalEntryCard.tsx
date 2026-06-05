import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { CARD_METADATA_TEXT_CLASS, CARD_MUTED_CAPTION_CLASS, ICON_TOUCH_HIT_SLOP } from '@/constants';
import type { JournalEntryRecord } from '@/types/journal';
import { cn } from '@/utils';

import {
    JOURNAL_CATEGORY_LABELS,
    JOURNAL_ENTRY_TYPE_LABELS,
    JOURNAL_UI,
} from '../constants/journal-ui';
import { VAULT_UI } from '../constants/vault-ui';
import { JournalService } from '../services/journal-service';
import { isReviewDue } from '../utils/journal-review';
import { hasSameJournalEntryCardSnapshot } from '../utils/journal-entry-card-memo';
import { extractEnglishBodyForDisplay } from '../utils/journal-transcription-body';
import { getSpaceLabel } from '../utils/vault-map-builder';
import { JournalEntryBodyTranslation } from './JournalEntryBodyTranslation';
import { JournalEntryImageGallery } from './JournalEntryImageGallery';
import { JournalVoicePlayer } from './JournalVoicePlayer';
import { JournalImportanceBadge } from './vault/JournalImportanceBadge';

type JournalEntryCardProps = {
  entry: JournalEntryRecord;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onReview?: () => void;
  compact?: boolean;
};

const JournalEntryCardComponent = ({
  entry,
  onPress,
  onToggleFavorite,
  onReview,
  compact = false,
}: JournalEntryCardProps) => {
  const due = isReviewDue(entry.nextReviewAt);
  const spaceLabel = getSpaceLabel(entry.spaceKey);
  const bodyPreview = entry.body ? extractEnglishBodyForDisplay(entry.body) : '';

  return (
    <GameCard className={cn(compact ? 'p-3' : 'p-4', due ? 'border-primary/40' : '')}>
      <View className="flex-row items-start gap-2">
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          className="min-w-0 flex-1"
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityLabel={onPress ? `${entry.title}. ${spaceLabel}` : undefined}>
          <View className="flex-row items-start gap-2">
            <Text className="text-xl">
              {entry.audioUri && entry.images.length > 0
                ? '🎙️📷'
                : entry.audioUri
                  ? '🎙️'
                  : entry.images.length > 0
                    ? '📷'
                    : '📝'}
            </Text>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1">
                {entry.isPinned ? (
                  <Text className={cn(CARD_METADATA_TEXT_CLASS, 'text-primary')}>{VAULT_UI.pinnedKnowledge}</Text>
                ) : null}
                <Text className="text-base font-bold text-foreground" numberOfLines={2}>
                  {entry.title}
                </Text>
              </View>
              <Text className="mt-0.5 text-xs text-muted">
                {spaceLabel} · {JOURNAL_ENTRY_TYPE_LABELS[entry.entryType]} ·{' '}
                {JOURNAL_CATEGORY_LABELS[entry.category]}
              </Text>
              {bodyPreview ? (
                <Text
                  className={cn('mt-2 text-foreground-secondary', compact ? 'text-xs' : 'text-sm')}
                  numberOfLines={compact ? 3 : 6}>
                  {bodyPreview}
                </Text>
              ) : null}
              {entry.tags.length > 0 ? (
                <Text className={cn('mt-1', CARD_MUTED_CAPTION_CLASS)} numberOfLines={1}>
                  {entry.tags.map((t) => `#${t}`).join(' ')}
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={ICON_TOUCH_HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={entry.isFavorite ? JOURNAL_UI.unfavorite : JOURNAL_UI.favorite}>
          <Text className="text-lg">{entry.isFavorite ? '⭐' : '☆'}</Text>
        </Pressable>
      </View>

      {entry.body ? <JournalEntryBodyTranslation body={entry.body} compact className="mt-2" /> : null}

      {entry.images.length > 0 ? (
        <View className="mt-3">
          <JournalEntryImageGallery images={entry.images} compact={compact} />
        </View>
      ) : null}

      {entry.audioUri ? (
        <View className="mt-3">
          <JournalVoicePlayer
            entryId={entry.id}
            audioUri={entry.audioUri}
            durationMs={entry.audioDurationMs}
            compact={compact}
          />
        </View>
      ) : null}

      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        <JournalImportanceBadge importance={entry.importance} compact />
        {due && onReview ? (
          <Pressable
            onPress={onReview}
            className="rounded-full bg-primary px-3 py-1.5"
            accessibilityRole="button"
            accessibilityLabel={VAULT_UI.reviewCta}>
            <Text className="text-[10px] font-bold text-white">{VAULT_UI.reviewCta}</Text>
          </Pressable>
        ) : null}
      </View>

      {due && !compact ? (
        <Text className="mt-2 text-xs italic text-primary">
          {JournalService.getReviewMessage(entry)}
        </Text>
      ) : null}
    </GameCard>
  );
};

export const JournalEntryCard = memo(
  JournalEntryCardComponent,
  (prev, next) =>
    prev.compact === next.compact &&
    Boolean(prev.onReview) === Boolean(next.onReview) &&
    hasSameJournalEntryCardSnapshot(prev.entry, next.entry),
);
