import { router, type Href } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { GameDisplayText } from '@/components/ui/game';
import { theme } from '@/constants';
import { cn } from '@/utils';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  showBack?: boolean;
  emoji?: string;
};

const handleBack = () => {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/(tabs)' as Href);
};

export const ScreenHeader = ({ title, subtitle, className, showBack, emoji }: ScreenHeaderProps) => {
  if (showBack) {
    return (
      <View className={cn('mb-6 pt-2', className)}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="rounded-xl border border-border bg-surface-elevated p-2">
            <AppIcon name="arrow-back" size={22} color={theme.colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <GameDisplayText variant="hero" accessibilityRole="header" numberOfLines={2}>
              {emoji ? `${emoji} ` : ''}{title}
            </GameDisplayText>
            {subtitle ? (
              <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={cn('mb-6 pt-2', className)}>
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-1.5 w-12 rounded-full bg-primary" />
        <View className="h-1 w-6 rounded-full bg-gold/70" />
      </View>
      <GameDisplayText variant="hero" accessibilityRole="header" numberOfLines={2}>
        {emoji ? `${emoji} ` : ''}{title}
      </GameDisplayText>
      {subtitle ? (
        <Text className="mt-2  leading-relaxed text-foreground-secondary">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};
