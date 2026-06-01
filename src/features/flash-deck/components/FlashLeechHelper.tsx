import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { FlashCardRecord } from '@/types/flash-card';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';
import { FlashSrsService } from '../services/flash-srs-service';

type FlashLeechHelperProps = {
  deckId: string;
  onChanged: () => void;
};

export const FlashLeechHelper = ({ deckId, onChanged }: FlashLeechHelperProps) => {
  const [leeches, setLeeches] = useState<FlashCardRecord[]>([]);

  const load = useCallback(async () => {
    const cards = await FlashDeckService.listCards(deckId);
    setLeeches(cards.filter((card) => FlashSrsService.isLeech(card)));
  }, [deckId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (leeches.length === 0) return null;

  const handleSuspend = async (cardId: string) => {
    await FlashDeckService.suspendCard(cardId, true);
    await load();
    onChanged();
  };

  const handleResetLapses = async (cardId: string) => {
    await FlashDeckService.resetLeechCard(cardId);
    await load();
    onChanged();
  };

  return (
    <GameCard className="border-warning/40">
      <Text className="text-sm font-bold text-warning">{FLASH_DECK_UI.leechHelperTitle}</Text>
      <Text className="mt-1 text-xs text-foreground-secondary">{FLASH_DECK_UI.leechHelperBody}</Text>
      <View className="mt-3 gap-3">
        {leeches.slice(0, 5).map((card) => (
          <View key={card.id} className="gap-2 rounded-xl border border-border/60 p-3">
            <Text className="font-semibold text-foreground">{card.front}</Text>
            <Text className="text-sm text-muted">{card.back}</Text>
            <View className="flex-row gap-2">
              <Button
                label={FLASH_DECK_UI.leechSuspend}
                variant="ghost"
                onPress={() => void handleSuspend(card.id)}
              />
              <Button
                label={FLASH_DECK_UI.leechReset}
                variant="secondary"
                onPress={() => void handleResetLapses(card.id)}
              />
            </View>
          </View>
        ))}
      </View>
    </GameCard>
  );
};
