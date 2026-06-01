import { Modal, Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';

import { DUEL_UI } from '../constants/duel-ui';

type DuelSaveCardModalProps = {
  visible: boolean;
  front: string;
  back: string;
  isSaving: boolean;
  onSave: () => void;
  onDismiss: () => void;
};

export const DuelSaveCardModal = ({
  visible,
  front,
  back,
  isSaving,
  onSave,
  onDismiss,
}: DuelSaveCardModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
    <View className="flex-1 items-center justify-center bg-black/60 px-6">
      <GameCard className="w-full max-w-md">
        <Text className="text-lg font-black text-foreground">{DUEL_UI.saveCardTitle}</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">{DUEL_UI.saveCardBody}</Text>
        <View className="mt-4 rounded-xl border border-border bg-background-secondary/80 p-3">
          <Text className="text-xs font-bold uppercase text-muted">{DUEL_UI.saveCardFrontLabel}</Text>
          <Text className="mt-1 text-base font-semibold text-foreground">{front}</Text>
          <Text className="mt-3 text-xs font-bold uppercase text-muted">{DUEL_UI.saveCardBackLabel}</Text>
          <Text className="mt-1 text-base text-foreground-secondary">{back}</Text>
        </View>
        <View className="mt-4 gap-2">
          <Button
            label={DUEL_UI.saveCardConfirm}
            onPress={onSave}
            loading={isSaving}
            loadingLabel="Salvando…"
            accessibilityLabel={DUEL_UI.saveCardConfirm}
          />
          <Button
            label={DUEL_UI.saveCardDismiss}
            variant="ghost"
            onPress={onDismiss}
            disabled={isSaving}
            accessibilityLabel={DUEL_UI.saveCardDismiss}
          />
        </View>
      </GameCard>
    </View>
  </Modal>
);
