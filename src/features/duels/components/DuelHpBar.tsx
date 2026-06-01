import { Text, View } from 'react-native';

import { cn } from '@/utils';

type DuelHpBarProps = {
  label: string;
  current: number;
  max: number;
  align?: 'left' | 'right';
  tone?: 'player' | 'enemy';
};

export const DuelHpBar = ({ label, current, max, align = 'left', tone = 'player' }: DuelHpBarProps) => {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const fillClass = tone === 'enemy' ? 'bg-danger' : 'bg-primary';
  const lowHp = ratio <= 0.25;

  return (
    <View className={cn('gap-1.5', align === 'right' && 'items-end')}>
      <View className={cn('flex-row items-center gap-2', align === 'right' && 'flex-row-reverse')}>
        <Text className="text-[10px] font-black uppercase tracking-widest text-muted">{label}</Text>
        <Text className={cn('text-xs font-black', lowHp ? 'text-danger' : 'text-foreground')}>
          {current}/{max} HP
        </Text>
      </View>
      <View
        className={cn(
          'h-3 overflow-hidden rounded-full border-2 border-border/80 bg-background/90',
          align === 'right' ? 'w-full' : 'w-full',
        )}>
        <View
          className={cn('h-full rounded-full', fillClass, lowHp && 'bg-danger')}
          style={{ width: `${Math.max(ratio * 100, 2)}%` }}
        />
      </View>
    </View>
  );
};
