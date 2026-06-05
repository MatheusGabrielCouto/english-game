import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { GameDisplayText } from '@/components/ui/game/GameDisplayText';
import { theme } from '@/constants';
import { cn } from '@/utils';

type CoinDisplayProps = {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeStyles = {
  sm: { icon: 14, variant: 'label' as const },
  md: { icon: 18, variant: 'value' as const },
  lg: { icon: 22, variant: 'hero' as const },
};

export const CoinDisplay = ({ amount, size = 'md', className }: CoinDisplayProps) => {
  const styles = sizeStyles[size];

  return (
    <View className={cn('flex-row items-center gap-1.5', className)}>
      <AppIcon name="logo-bitcoin" size={styles.icon} color={theme.colors.coin} />
      <GameDisplayText variant={styles.variant} className="text-coin">
        {amount}
      </GameDisplayText>
    </View>
  );
};
