import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, FormSheetModal } from '@/components';
import { useAsyncAction } from '@/hooks';
import { cn } from '@/utils';

import type { FlashDeckRecord } from '@/types/flash-card';
import { FLASH_DECK_EMOJI_OPTIONS, FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';

type FlashDeckFormModalProps = {
  visible: boolean;
  deck?: FlashDeckRecord | null;
  onClose: () => void;
  onSaved: () => void;
};

export const FlashDeckFormModal = ({ visible, deck, onClose, onSaved }: FlashDeckFormModalProps) => {
  const isEdit = Boolean(deck);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState<string>(FLASH_DECK_UI.emoji);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(deck?.name ?? '');
    setDescription(deck?.description ?? '');
    setEmoji(deck?.coverEmoji ?? FLASH_DECK_UI.emoji);
    setError(null);
  }, [visible, deck]);

  const { run: save, isPending } = useAsyncAction(async () => {
    setError(null);
    try {
      if (isEdit && deck) {
        await FlashDeckService.updateDeck(deck.id, {
          name,
          description: description.trim() || null,
          coverEmoji: emoji,
        });
      } else {
        await FlashDeckService.createDeck({
          name,
          description: description.trim() || undefined,
          coverEmoji: emoji,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar');
    }
  });

  return (
    <FormSheetModal
      visible={visible}
      onClose={onClose}
      sheetHeightRatio={0.72}
      animationType="fade"
      header={
        <View className="px-4 pb-2 pt-4">
          <Text className="text-lg font-black text-foreground">
            {isEdit ? FLASH_DECK_UI.editDeck : FLASH_DECK_UI.newDeck}
          </Text>
        </View>
      }
      footer={
        <View className="gap-2 px-4 pb-8 pt-2">
          <Button
            label={FLASH_DECK_UI.saveDeck}
            onPress={() => void save()}
            loading={isPending}
            loadingLabel="Salvando…"
            disabled={!name.trim()}
          />
          <Button label="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      }>
      <View className="gap-4 px-4 pb-4">
        <View>
          <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.deckNameLabel}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={FLASH_DECK_UI.deckNamePlaceholder}
            placeholderTextColor="#71717a"
            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-foreground">{FLASH_DECK_UI.deckEmojiLabel}</Text>
          <View className="flex-row flex-wrap gap-2">
            {FLASH_DECK_EMOJI_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => setEmoji(option)}
                accessibilityRole="button"
                accessibilityLabel={`Emoji ${option}`}
                className={cn(
                  'rounded-xl border px-3 py-2',
                  emoji === option ? 'border-primary bg-primary/20' : 'border-border bg-surface',
                )}>
                <Text className="text-xl">{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-foreground">
            {FLASH_DECK_UI.deckDescriptionLabel}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ex.: Palavras para entrevistas em inglês"
            placeholderTextColor="#71717a"
            multiline
            className="min-h-[72px] rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
          />
        </View>

        {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      </View>
    </FormSheetModal>
  );
};
