import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Modal } from '@/components';
import type { LexiconBrickRecord } from '@/types/lexicon-brick';

import { CITY_UI } from '../constants/city-ui';
import { LexiconBrickService } from '../services/lexicon-brick-service';

type MemoryWallRepairModalProps = {
  visible: boolean;
  brick: LexiconBrickRecord | null;
  onClose: () => void;
  onRepaired: () => void;
};

export const MemoryWallRepairModal = ({
  visible,
  brick,
  onClose,
  onRepaired,
}: MemoryWallRepairModalProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const choices = useMemo(
    () => (brick ? LexiconBrickService.buildRepairChoices(brick.lemma) : []),
    [brick],
  );

  const handleChoose = async (lemma: string) => {
    if (!brick) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await LexiconBrickService.repairBrick(brick.brickId, lemma);
      if (!result.ok) {
        setMessage(
          result.reason === 'wrong_answer'
            ? CITY_UI.memoryWallRepairWrong
            : CITY_UI.memoryWallCrackedHint,
        );
        return;
      }
      setMessage(CITY_UI.memoryWallRepairSuccess(brick.lemma));
      onRepaired();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!brick) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title={CITY_UI.memoryWallRepairTitle}
      description={CITY_UI.memoryWallRepairPrompt(brick.translation)}
      footerMode="none"
      scrollable={false}
    >
      <View className="gap-2 py-2">
        {choices.map((choice) => (
          <Pressable
            key={choice}
            disabled={submitting}
            onPress={() => void handleChoose(choice)}
            accessibilityRole="button"
            accessibilityLabel={choice}
            className="rounded-xl border border-border bg-surface-elevated px-4 py-3 active:opacity-80"
          >
            <Text className="text-center text-base font-semibold text-foreground">{choice}</Text>
          </Pressable>
        ))}
        {message ? (
          <Text className="text-center text-sm text-foreground-secondary">{message}</Text>
        ) : null}
      </View>
    </Modal>
  );
};
