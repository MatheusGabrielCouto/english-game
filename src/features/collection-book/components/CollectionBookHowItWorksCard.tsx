import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { useHowItWorksSeen } from '@/hooks';

import { COLLECTION_BOOK_UI } from '../constants/collection-book-ui';

export const CollectionBookHowItWorksCard = () => {
  const { shouldShow } = useHowItWorksSeen('collection-book');

  if (!shouldShow) return null;

  return (
  <GameCard variant="default" className="gap-3 p-4">
    <Text className="text-xs font-bold uppercase tracking-wide text-muted">Como funciona</Text>
    {COLLECTION_BOOK_UI.howItWorks.map((line) => (
      <View key={line} className="flex-row gap-2">
        <Text className="text-sm text-accent">•</Text>
        <Text className="min-w-0 flex-1 text-sm leading-5 text-foreground-secondary">{line}</Text>
      </View>
    ))}
  </GameCard>
  );
};
