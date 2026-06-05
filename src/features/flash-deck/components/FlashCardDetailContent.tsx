import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { Button } from '@/components';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { useAsyncAction } from '@/hooks';
import type { FlashCardRecord } from '@/types/flash-card';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';
import { useFlashDeckStore } from '../store/flash-deck-store';
import { flashDeckRoutes } from '../utils/flash-deck-routes';
import { FlashCardStateBadge } from './FlashCardStateBadge';

export const FlashCardDetailContent = () => {
  const { id: cardId } = useLocalSearchParams<{ id: string }>();
  const refreshHub = useFlashDeckStore((s) => s.refresh);
  const refreshDeck = useFlashDeckStore((s) => s.refreshDeck);

  const [card, setCard] = useState<FlashCardRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cardId) return;

    setLoading(true);
    try {
      const row = await FlashDeckService.getCard(cardId);
      setCard(row);
      if (row) {
        setFront(row.front);
        setBack(row.back);
        setExample(row.exampleSentence ?? '');
        setTagsInput(row.tags.join(', '));
      }
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const { run: saveCard, isPending: saving } = useAsyncAction(async () => {
    if (!cardId) return;

    setError(null);
    try {
      const updated = await FlashDeckService.updateCard(cardId, {
        front,
        back,
        exampleSentence: example.trim() || null,
        tagsInput,
      });
      setCard(updated);
      await refreshHub();
      await refreshDeck(updated.deckId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a carta');
    }
  });

  const handleDelete = useCallback(() => {
    if (!card) return;

    Alert.alert(FLASH_DECK_UI.deleteCard, FLASH_DECK_UI.deleteCardConfirm, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await FlashDeckService.deleteCard(card.id);
            await refreshHub();
            await refreshDeck(card.deckId);
            router.replace(flashDeckRoutes.deck(card.deckId));
          })();
        },
      },
    ]);
  }, [card, refreshDeck, refreshHub]);

  if (!cardId) {
    return <Text className="text-center text-sm text-muted">Carta não encontrada.</Text>;
  }

  if (loading) {
    return <ScreenSkeleton variant="session" />;
  }

  if (!card) {
    return (
      <View className="gap-4 py-8">
        <Text className="text-center text-base text-foreground-secondary">
          Esta carta não existe mais.
        </Text>
        <Button label={FLASH_DECK_UI.backToHub} variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-black text-foreground">{FLASH_DECK_UI.editCard}</Text>
        <FlashCardStateBadge card={card} />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.frontLabel}</Text>
        <TextInput
          value={front}
          onChangeText={setFront}
          placeholder={FLASH_DECK_UI.frontPlaceholder}
          placeholderTextColor="#71717a"
          autoCapitalize="none"
          autoCorrect={false}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.backLabel}</Text>
        <TextInput
          value={back}
          onChangeText={setBack}
          placeholder={FLASH_DECK_UI.backPlaceholder}
          placeholderTextColor="#71717a"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.exampleLabel}</Text>
        <TextInput
          value={example}
          onChangeText={setExample}
          placeholder={FLASH_DECK_UI.examplePlaceholder}
          placeholderTextColor="#71717a"
          autoCapitalize="none"
          multiline
          className="min-h-[88px] rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.tagsLabel}</Text>
        <TextInput
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder={FLASH_DECK_UI.tagsPlaceholder}
          placeholderTextColor="#71717a"
          autoCapitalize="none"
          autoCorrect={false}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
        />
      </View>

      {error ? <Text className="text-sm text-danger">{error}</Text> : null}

      <Button
        label={FLASH_DECK_UI.saveCard}
        onPress={() => void saveCard()}
        loading={saving}
        loadingLabel="Salvando…"
        disabled={!front.trim() || !back.trim()}
      />
      <Button label={FLASH_DECK_UI.deleteCard} variant="danger" onPress={handleDelete} />
    </View>
  );
};
