import { Text, View } from 'react-native';

import type { FlashCardRecord } from '@/types/flash-card';
import { cn } from '@/utils';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashSrsService } from '../services/flash-srs-service';

type FlashCardStateBadgeProps = {
  card: Pick<FlashCardRecord, 'state' | 'intervalDays' | 'lapseCount' | 'repetitions'>;
};

const stateStyles = {
  new: 'border-primary/40 bg-primary/15 text-primary',
  learning: 'border-sky-500/40 bg-sky-500/15 text-sky-400',
  review: 'border-accent/40 bg-accent/15 text-accent',
  relearning: 'border-warning/40 bg-warning/15 text-warning',
  mature: 'border-gold/40 bg-gold/15 text-gold',
} as const;

export const FlashCardStateBadge = ({ card }: FlashCardStateBadgeProps) => {
  const isLeech = FlashSrsService.isLeech(card);
  const state = FlashSrsService.resolveState(card);
  const label = isLeech ? '🪵 Pregueira' : FLASH_DECK_UI.stateLabels[state];

  return (
    <View
      className={cn(
        'self-center rounded-full border px-3 py-1',
        isLeech ? 'border-warning/50 bg-warning/10' : stateStyles[state],
      )}>
      <Text
        className={cn(
          'text-[10px] font-bold uppercase tracking-wide',
          isLeech ? 'text-warning' : '',
        )}>
        {label}
      </Text>
    </View>
  );
};
