import { Text, View } from 'react-native';

import { Button, Card } from '@/components';

import { GAME_TUTORIAL_MESSAGES } from '../constants/game-tutorial-steps';
import { useGameTutorial } from '../hooks/use-game-tutorial';

type TutorialGuideCardProps = {
  compact?: boolean;
};

export const TutorialGuideCard = ({ compact = false }: TutorialGuideCardProps) => {
  const { handleOpen, hasOnboarded } = useGameTutorial();

  if (compact) {
    return (
      <Button
        label={`📖 ${GAME_TUTORIAL_MESSAGES.reopen}`}
        variant="secondary"
        size="sm"
        onPress={handleOpen}
        accessibilityLabel={GAME_TUTORIAL_MESSAGES.reopen}
      />
    );
  }

  return (
    <Card elevated className="gap-3 p-4">
      <View className="flex-row items-start gap-3">
        <Text className="text-3xl">📖</Text>
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">{GAME_TUTORIAL_MESSAGES.reopen}</Text>
          <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">
            {hasOnboarded
              ? 'Revise moedas, loot boxes, Study Points e prestígio quando quiser.'
              : 'Aprenda como funcionam moedas, loot boxes e Study Points.'}
          </Text>
        </View>
      </View>
      <Button label="Abrir guia" onPress={handleOpen} accessibilityLabel="Abrir guia do jogo" />
    </Card>
  );
};
