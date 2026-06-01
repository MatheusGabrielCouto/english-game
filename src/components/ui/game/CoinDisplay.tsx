import { Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { theme } from '@/constants';
import { cn } from '@/utils';

type CoinDisplayProps = {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeStyles = {
  sm: { icon: 14, text: 'text-sm' },
  md: { icon: 18, text: 'text-lg' },
  lg: { icon: 22, text: 'text-2xl' },
};

export const CoinDisplay = ({ amount, size = 'md', className }: CoinDisplayProps) => {
  const styles = sizeStyles[size];

  return (
    <View className={cn('flex-row items-center gap-1.5', className)}>
      <AppIcon name="logo-bitcoin" size={styles.icon} color={theme.colors.coin} />
      <Text className={cn('font-black text-coin', styles.text)}>{amount}</Text>
    </View>
  );
};
