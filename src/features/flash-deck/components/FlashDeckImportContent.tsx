import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';
import { useFlashDeckStore } from '../store/flash-deck-store';
import { parseFlashCardsCsv } from '../utils/flash-csv-import';
import { flashDeckRoutes } from '../utils/flash-deck-routes';

export const FlashDeckImportContent = () => {
  const { deckId: deckIdParam } = useLocalSearchParams<{ deckId?: string }>();
  const deckId = deckIdParam?.trim() || DEFAULT_FLASH_DECK_ID;
  const refresh = useFlashDeckStore((s) => s.refresh);
  const refreshDeck = useFlashDeckStore((s) => s.refreshDeck);

  const [loading, setLoading] = useState(false);

  const handlePick = useCallback(async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const parsed = parseFlashCardsCsv(raw);

      if (parsed.rows.length === 0) {
        Alert.alert('Importar', 'Nenhuma linha válida no arquivo.');
        return;
      }

      const outcome = await FlashDeckService.importCardsFromCsv(deckId, parsed.rows);
      await refresh();
      await refreshDeck(deckId);

      Alert.alert('Importar', FLASH_DECK_UI.importCsvSuccess(outcome.imported, outcome.failed), [
        { text: 'OK', onPress: () => router.replace(flashDeckRoutes.deck(deckId)) },
      ]);
    } catch (err) {
      Alert.alert('Importar', err instanceof Error ? err.message : 'Falha ao importar');
    } finally {
      setLoading(false);
    }
  }, [deckId, refresh, refreshDeck]);

  return (
    <View className="gap-4">
      <GameCard>
        <Text className="text-lg font-black text-foreground">{FLASH_DECK_UI.importCsvTitle}</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">{FLASH_DECK_UI.importCsvHint}</Text>
      </GameCard>
      <Button
        label={FLASH_DECK_UI.importCsvPick}
        onPress={() => void handlePick()}
        loading={loading}
        loadingLabel="Importando…"
      />
    </View>
  );
};
