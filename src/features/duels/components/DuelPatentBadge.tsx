import { Text, View } from 'react-native';

import type { DuelPatent } from '@/types/duel';
import { DUEL_PATENT_LABELS } from '@/types/duel';
import { cn } from '@/utils';

type DuelPatentBadgeProps = {
  patent: DuelPatent;
  size?: 'sm' | 'md';
};

export const DuelPatentBadge = ({ patent, size = 'md' }: DuelPatentBadgeProps) => (
  <View
    className={cn(
      'self-start rounded-full border border-primary/40 bg-primary/15',
      size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5',
    )}>
    <Text
      className={cn(
        'font-bold uppercase tracking-widest text-primary',
        size === 'sm' ? 'text-[10px]' : 'text-xs',
      )}>
      {DUEL_PATENT_LABELS[patent]}
    </Text>
  </View>
);
