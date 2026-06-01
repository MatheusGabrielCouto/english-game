import { Text, View } from 'react-native';

import { cn } from '@/utils';

type LevelBadgeProps = {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeStyles = {
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-11 w-11', text: 'text-sm' },
  lg: { container: 'h-14 w-14', text: 'text-lg' },
};

export const LevelBadge = ({ level, size = 'md', className }: LevelBadgeProps) => {
  const styles = sizeStyles[size];

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full border-2 border-gold bg-gold/20',
        styles.container,
        className,
      )}
      accessibilityLabel={`Nível ${level}`}>
      <Text className={cn('font-black text-gold', styles.text)}>{level}</Text>
    </View>
  );
};
