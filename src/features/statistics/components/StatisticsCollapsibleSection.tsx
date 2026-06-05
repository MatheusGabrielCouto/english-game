import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { GameCard } from '@/components/ui/game';
import { theme } from '@/constants';
import { cn } from '@/utils';

type StatisticsCollapsibleSectionProps = {
  title: string;
  emoji: string;
  subtitle?: string;
  defaultOpen?: boolean;
  onExpand?: () => void;
  children: ReactNode;
};

export const StatisticsCollapsibleSection = ({
  title,
  emoji,
  subtitle,
  defaultOpen = false,
  onExpand,
  children,
}: StatisticsCollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setIsOpen((current) => {
      const next = !current;
      if (next) {
        onExpand?.();
      }
      return next;
    });
  };

  return (
    <GameCard variant="default" className="overflow-hidden p-0">
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${title}, ${isOpen ? 'recolher' : 'expandir'}`}
        className="flex-row items-center gap-3 px-4 py-3.5">
        <Text className="text-xl">{emoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-black text-foreground">{title}</Text>
          {subtitle ? (
            <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <AppIcon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.muted}
        />
      </Pressable>

      {isOpen ? (
        <View className={cn('gap-3 border-t border-border px-4 pb-4 pt-3')}>{children}</View>
      ) : null}
    </GameCard>
  );
};
