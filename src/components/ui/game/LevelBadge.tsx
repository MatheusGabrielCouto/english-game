import { View } from 'react-native';

import { cn } from '@/utils';

import { GameDisplayText } from './GameDisplayText';

type LevelBadgeProps = {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeStyles = {
  sm: { container: 'h-8 w-8', variant: 'label' as const },
  md: { container: 'h-11 w-11', variant: 'value' as const },
  lg: { container: 'h-14 w-14', variant: 'hero' as const },
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
      <GameDisplayText variant={styles.variant} className="text-gold">
        {level}
      </GameDisplayText>
    </View>
  );
};
