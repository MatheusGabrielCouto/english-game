import { Pressable, Text, View } from 'react-native';

import {
    LEARNING_CHOICE_LETTERS,
    LearningBattleFrame,
} from '@/features/learning/components/ui';
import type { McqPrompt } from '@/types/mcq-question';
import { cn } from '@/utils';

type McqQuestionCardProps = {
  prompt: McqPrompt;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  framed?: boolean;
};

export const McqQuestionCard = ({
  prompt,
  selectedIndex,
  onSelect,
  disabled = false,
  framed = true,
}: McqQuestionCardProps) => {
  const inner = (
    <View className="gap-4">
      <Text className="text-center text-lg font-black leading-7 text-foreground">{prompt.stem}</Text>

      <View className="gap-2.5">
        {prompt.choices.map((choice, index) => {
          const isSelected = selectedIndex === index;
          const letter = LEARNING_CHOICE_LETTERS[index] ?? '?';

          return (
            <Pressable
              key={`${choice}-${index}`}
              disabled={disabled}
              onPress={() => onSelect(index)}
              accessibilityRole="button"
              accessibilityLabel={`Opção ${letter}: ${choice}`}
              accessibilityState={{ selected: isSelected, disabled }}
              className={cn(
                'flex-row items-center gap-3 rounded-xl border-2 px-3 py-3 active:opacity-85',
                isSelected
                  ? 'border-primary bg-primary/20'
                  : 'border-border/80 bg-background/50',
                disabled && 'opacity-55',
              )}>
              <View
                className={cn(
                  'h-9 w-9 items-center justify-center rounded-lg border',
                  isSelected ? 'border-primary bg-primary/30' : 'border-border bg-surface',
                )}>
                <Text
                  className={cn(
                    'text-sm font-black',
                    isSelected ? 'text-primary' : 'text-muted',
                  )}>
                  {letter}
                </Text>
              </View>
              <Text
                className={cn(
                  'flex-1 text-base leading-5',
                  isSelected ? 'font-bold text-foreground' : 'text-foreground-secondary',
                )}>
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  if (!framed) return inner;

  return <LearningBattleFrame label="⚡ Pergunta">{inner}</LearningBattleFrame>;
};
