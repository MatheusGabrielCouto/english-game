import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/utils';

type VaultFormSectionProps = {
  emoji: string;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export const VaultFormSection = ({ emoji, title, hint, children, className }: VaultFormSectionProps) => (
  <View className={cn('overflow-hidden rounded-2xl border border-border/80 bg-surface p-4', className)}>
    <View className="mb-4 flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Text className="text-xl">{emoji}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-black text-foreground">{title}</Text>
        {hint ? (
          <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary">{hint}</Text>
        ) : null}
      </View>
    </View>
    <View className="gap-4">{children}</View>
  </View>
);
