import { Text, View } from 'react-native';

import type { JournalImportanceValue } from '@/types/journal';
import { cn } from '@/utils';

import { JOURNAL_IMPORTANCE_META } from '../../constants/journal-importance';

type JournalImportanceBadgeProps = {
  importance: JournalImportanceValue;
  compact?: boolean;
  className?: string;
};

export const JournalImportanceBadge = ({
  importance,
  compact = false,
  className,
}: JournalImportanceBadgeProps) => {
  const meta = JOURNAL_IMPORTANCE_META[importance];

  return (
    <View
      className={cn(
        'flex-row items-center gap-1 rounded-full border px-2 py-0.5',
        compact ? 'px-1.5' : 'px-2.5 py-1',
        className,
      )}
      style={{
        backgroundColor: meta.surfaceColor,
        borderColor: meta.color,
      }}>
      <Text className={compact ? 'text-[10px]' : 'text-xs'}>{meta.emoji}</Text>
      <Text
        className={cn('font-bold', compact ? 'text-[10px]' : 'text-xs')}
        style={{ color: meta.color }}>
        {meta.shortLabel}
      </Text>
    </View>
  );
};
