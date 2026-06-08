import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { Button } from '@/components';
import { VirtualizedList } from '@/components/ui';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { INPUT_PLACEHOLDER_COLOR, VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE } from '@/constants';
import { LearningHeroPanel } from '@/features/learning/components/ui';
import type { FlashCardRecord, FlashDeckRecord } from '@/types/flash-card';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';
import { cn } from '@/utils';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';
import { useFlashDeckStore } from '../store/flash-deck-store';
import { flashDeckRoutes } from '../utils/flash-deck-routes';
import { FlashDeckCardRow } from './FlashDeckCardRow';
import { FlashDeckFormModal } from './FlashDeckFormModal';
import { FlashDeckStatsCard } from './FlashDeckStatsCard';
import { FlashLeechHelper } from './FlashLeechHelper';

export const FlashDeckDetailContent = () => {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const refreshDeck = useFlashDeckStore((s) => s.refreshDeck);
  const refreshHub = useFlashDeckStore((s) => s.refresh);
  const activeDeckStats = useFlashDeckStore((s) => s.activeDeckStats);

  const [deck, setDeck] = useState<FlashDeckRecord | null>(null);
  const [cards, setCards] = useState<FlashCardRecord[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const loadDeckMeta = useCallback(async () => {
    if (!deckId) return;

    const [deckRow, tagList] = await Promise.all([
      FlashDeckService.getDeck(deckId),
      FlashDeckService.listDeckTags(deckId),
    ]);

    setDeck(deckRow);
    setTags(tagList);
    await refreshDeck(deckId);
  }, [deckId, refreshDeck]);

  const loadCards = useCallback(async () => {
    if (!deckId) return;

    const cardList = await FlashDeckService.listCards(deckId, {
      search,
      tag: selectedTag,
    });
    setCards(cardList);
  }, [deckId, search, selectedTag]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setLoading(true);
        try {
          await loadDeckMeta();
          await loadCards();
        } finally {
          setLoading(false);
        }
      })();
    }, [loadDeckMeta, loadCards]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCards();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedTag, loadCards]);

  const reviewCapHit =
    activeDeckStats.reviewsRemainingToday === 0 && activeDeckStats.reviewsToday > 0;
  const canCreateCard = activeDeckStats.newCardsRemainingToday > 0;

  const handleArchive = useCallback(() => {
    if (!deckId || deckId === DEFAULT_FLASH_DECK_ID) return;

    Alert.alert(FLASH_DECK_UI.archiveDeck, FLASH_DECK_UI.archiveDeckConfirm, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Arquivar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await FlashDeckService.archiveDeck(deckId);
            await refreshHub();
            router.back();
          })();
        },
      },
    ]);
  }, [deckId, refreshHub]);

  if (!deckId) {
    return <Text className="text-center text-sm text-muted">Caderno não encontrado.</Text>;
  }

  if (loading && !deck) {
    return <ScreenSkeleton variant="learning" className="gap-5 pb-0" />;
  }

  if (!deck) {
    return (
      <View className="gap-4 py-8">
        <Text className="text-center  text-foreground-secondary">
          Este caderno não existe ou foi arquivado.
        </Text>
        <Button label={FLASH_DECK_UI.backToHub} variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const deckHeader = (
    <>
      <LearningHeroPanel
        variant="deck"
        eyebrow="Caderno em jogo"
        emoji={deck.coverEmoji ?? FLASH_DECK_UI.emoji}
        headline={deck.name}
        subtitle={
          deck.description ??
          FLASH_DECK_UI.deckDueBadge(activeDeckStats.dueCount)
        }>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              label={FLASH_DECK_UI.startReview}
              onPress={() => router.push(flashDeckRoutes.review(deckId))}
              disabled={activeDeckStats.dueCount === 0 || reviewCapHit}
            />
          </View>
          <Button
            label={FLASH_DECK_UI.editDeck}
            variant="ghost"
            size="sm"
            onPress={() => setEditModalVisible(true)}
          />
        </View>
      </LearningHeroPanel>

      <FlashDeckStatsCard stats={activeDeckStats} />

      <FlashLeechHelper
        deckId={deckId}
        onChanged={() => {
          void loadCards();
          void loadDeckMeta();
        }}
      />

      <Button
        label={FLASH_DECK_UI.newCard}
        variant="secondary"
        onPress={() => router.push(flashDeckRoutes.createCard(deckId))}
        disabled={!canCreateCard}
      />

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={FLASH_DECK_UI.searchPlaceholder}
        placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
        autoCapitalize="none"
        autoCorrect={false}
        className="rounded-xl border border-border bg-surface px-4 py-3  text-foreground"
        accessibilityLabel={FLASH_DECK_UI.searchPlaceholder}
      />

      {tags.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          <Pressable
            onPress={() => setSelectedTag(null)}
            className={cn(
              'mr-2 rounded-full border px-3 py-1.5',
              selectedTag === null ? 'border-primary bg-primary/20' : 'border-border bg-surface',
            )}>
            <Text className={cn('text-xs font-semibold', selectedTag === null ? 'text-primary' : 'text-muted')}>
              {FLASH_DECK_UI.allTags}
            </Text>
          </Pressable>
          {tags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => setSelectedTag(tag)}
              className={cn(
                'mr-2 rounded-full border px-3 py-1.5',
                selectedTag === tag ? 'border-primary bg-primary/20' : 'border-border bg-surface',
              )}>
              <Text className={cn('text-xs font-semibold', selectedTag === tag ? 'text-primary' : 'text-muted')}>
                #{tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </>
  )

  const deckFooter = (
    <>
      {cards.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-border px-4 py-8">
          <Text className="text-center  font-bold text-foreground">{FLASH_DECK_UI.deckEmptyTitle}</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-foreground-secondary">
            {FLASH_DECK_UI.deckEmptyBody}
          </Text>
        </View>
      ) : null}

      {deckId !== DEFAULT_FLASH_DECK_ID ? (
        <Button label={FLASH_DECK_UI.archiveDeck} variant="danger" onPress={handleArchive} />
      ) : null}

      <FlashDeckFormModal
        visible={editModalVisible}
        deck={deck}
        onClose={() => setEditModalVisible(false)}
        onSaved={() => {
          void loadDeckMeta();
          void refreshHub();
        }}
      />
    </>
  )

  if (cards.length > 20) {
    return (
      <VirtualizedList
        data={cards}
        className="flex-1"
        estimatedItemSize={VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.flashCard}
        keyExtractor={(card) => card.id}
        ListHeaderComponent={<View className="gap-4">{deckHeader}</View>}
        ListFooterComponent={<View className="gap-4 pb-4">{deckFooter}</View>}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={(card) => <FlashDeckCardRow card={card} />}
        extraData={`${search}-${selectedTag ?? ''}`}
      />
    )
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 pb-4">
      {deckHeader}
      {cards.length > 0 ? (
        <View className="gap-2">
          {cards.map((card) => (
            <FlashDeckCardRow key={card.id} card={card} />
          ))}
        </View>
      ) : null}
      {deckFooter}
    </ScrollView>
  );
};
