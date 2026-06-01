import { Text, View } from 'react-native';

import { usePlayerStore, usePlayerXP } from '@/features/player';
import { cn } from '@/utils';

import { ProgressBar } from './ProgressBar';

type XPBarProps = {
  className?: string;
  showLevel?: boolean;
};

export const XPBar = ({ className, showLevel = true }: XPBarProps) => {
  const level = usePlayerStore((s) => s.level);
  const { current, required } = usePlayerXP();

  return (
    <View className={cn('w-full', className)}>
      {showLevel ? (
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-foreground-secondary">
            Nível {level}
          </Text>
          <Text className="text-sm font-semibold text-accent">
            {current} / {required} XP
          </Text>
        </View>
      ) : null}
      <ProgressBar
        value={current}
        max={required}
        accessibilityLabel={`Experiência: ${current} de ${required}`}
      />
    </View>
  );
};
