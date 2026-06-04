import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';

type VaultEmptyStateProps = {
  emoji: string;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export const VaultEmptyState = ({ emoji, title, body, ctaLabel, onCta }: VaultEmptyStateProps) => (
  <GameCard className="items-center border-dashed border-border py-8">
    <Text className="text-4xl">{emoji}</Text>
    <Text className="mt-3 text-center text-base font-bold text-foreground">{title}</Text>
    <Text className="mt-2 text-center text-sm leading-5 text-foreground-secondary">{body}</Text>
    {ctaLabel && onCta ? (
      <View className="mt-5 w-full">
        <Button label={ctaLabel} onPress={onCta} />
      </View>
    ) : null}
  </GameCard>
);
