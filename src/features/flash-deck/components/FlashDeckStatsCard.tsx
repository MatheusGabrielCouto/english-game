import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { CARD_METADATA_TEXT_CLASS, CARD_MUTED_CAPTION_CLASS } from '@/constants';
import { cn } from '@/utils';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import type { FlashDeckStats } from '../services/flash-deck-service';

type FlashDeckStatsCardProps = {
  stats: FlashDeckStats;
};

const StatCell = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => (
  <View
    className={`min-w-[30%] flex-1 items-center rounded-xl border-2 px-2 py-2.5 ${
      highlight ? 'border-accent/50 bg-accent/10' : 'border-border/60 bg-surface-elevated/80'
    }`}>
    <Text className={`text-lg font-black ${highlight ? 'text-accent' : 'text-foreground'}`}>
      {value}
    </Text>
    <Text className={cn('mt-0.5', CARD_METADATA_TEXT_CLASS, 'text-muted')}>{label}</Text>
  </View>
);

export const FlashDeckStatsCard = ({ stats }: FlashDeckStatsCardProps) => (
  <GameCard variant="reward" className="gap-3 border-gold/25">
    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
      {FLASH_DECK_UI.statsTitle}
    </Text>

    <View className="flex-row flex-wrap gap-2">
      <StatCell label={FLASH_DECK_UI.statsNew} value={stats.newCount} />
      <StatCell label={FLASH_DECK_UI.statsLearning} value={stats.learningCount} />
      <StatCell label={FLASH_DECK_UI.statsDue} value={stats.dueCount} highlight />
      <StatCell label={FLASH_DECK_UI.statsMature} value={stats.matureCount} />
      {stats.leechCount > 0 ? (
        <StatCell label={FLASH_DECK_UI.statsLeech} value={stats.leechCount} highlight />
      ) : null}
    </View>

    <Text className="text-center text-sm font-black text-gold">
      {FLASH_DECK_UI.statsStreak(stats.reviewStreakDays)}
    </Text>
    <Text className="text-center text-xs text-foreground-secondary">
      {FLASH_DECK_UI.statsReviewsToday(stats.reviewsToday, stats.reviewsToday + stats.reviewsRemainingToday)}
    </Text>
    <Text className={cn('text-center', CARD_MUTED_CAPTION_CLASS)}>
      {FLASH_DECK_UI.statsNewToday(
        stats.newCardsCreatedToday,
        stats.newCardsCreatedToday + stats.newCardsRemainingToday,
      )}
    </Text>
  </GameCard>
);
