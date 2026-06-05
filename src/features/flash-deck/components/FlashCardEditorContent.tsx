import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button } from '@/components';
import { INPUT_PLACEHOLDER_COLOR } from '@/constants';
import { useAsyncAction } from '@/hooks';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';
import { useFlashDeckStore } from '../store/flash-deck-store';
import { flashDeckRoutes } from '../utils/flash-deck-routes';

export const FlashCardEditorContent = () => {
  const { deckId: deckIdParam } = useLocalSearchParams<{ deckId?: string }>();
  const deckId = deckIdParam?.trim() || DEFAULT_FLASH_DECK_ID;

  const refresh = useFlashDeckStore((s) => s.refresh);
  const refreshDeck = useFlashDeckStore((s) => s.refreshDeck);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { run: saveCard, isPending } = useAsyncAction(async () => {
    setError(null);
    try {
      await FlashDeckService.createCard({
        deckId,
        front,
        back,
        exampleSentence: example.trim() || undefined,
        tagsInput,
      });
      await refresh();
      await refreshDeck(deckId);
      router.replace(flashDeckRoutes.deck(deckId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a carta');
    }
  });

  const handleSave = useCallback(() => {
    void saveCard();
  }, [saveCard]);

  return (
    <View className="gap-4">
      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.frontLabel}</Text>
        <TextInput
          value={front}
          onChangeText={setFront}
          placeholder={FLASH_DECK_UI.frontPlaceholder}
          placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
          autoCapitalize="none"
          autoCorrect={false}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
          accessibilityLabel={FLASH_DECK_UI.frontLabel}
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.backLabel}</Text>
        <TextInput
          value={back}
          onChangeText={setBack}
          placeholder={FLASH_DECK_UI.backPlaceholder}
          placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
          accessibilityLabel={FLASH_DECK_UI.backLabel}
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.exampleLabel}</Text>
        <TextInput
          value={example}
          onChangeText={setExample}
          placeholder={FLASH_DECK_UI.examplePlaceholder}
          placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
          autoCapitalize="none"
          multiline
          className="min-h-[88px] rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
          accessibilityLabel={FLASH_DECK_UI.exampleLabel}
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.tagsLabel}</Text>
        <TextInput
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder={FLASH_DECK_UI.tagsPlaceholder}
          placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
          autoCapitalize="none"
          autoCorrect={false}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
          accessibilityLabel={FLASH_DECK_UI.tagsLabel}
        />
      </View>

      {error ? <Text className="text-sm text-danger">{error}</Text> : null}

      <Button
        label={FLASH_DECK_UI.saveCard}
        onPress={handleSave}
        loading={isPending}
        loadingLabel="Salvando…"
        disabled={!front.trim() || !back.trim()}
      />
    </View>
  );
};
