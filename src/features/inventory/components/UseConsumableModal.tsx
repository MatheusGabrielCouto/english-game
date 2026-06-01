import { Text, View } from 'react-native';

import { Modal } from '@/components';
import { resolveGameItem } from '@/features/game-design/catalogs/item-catalog';
import type { SpecialItemRecord } from '@/types/inventory';

type UseConsumableModalProps = {
  item: SpecialItemRecord | null;
  visible: boolean;
  isUsing: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const UseConsumableModal = ({
  item,
  visible,
  isUsing,
  onClose,
  onConfirm,
}: UseConsumableModalProps) => {
  if (!item) return null;

  const def = resolveGameItem(item.itemKey);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title={def?.name ?? item.itemKey}
      description={def?.description ?? 'Usar este item do inventário?'}
      confirmLabel={isUsing ? 'Usando…' : 'Usar item'}
      cancelLabel="Cancelar"
      onConfirm={isUsing ? undefined : onConfirm}
      onCancel={onClose}
    >
      <View className="items-center gap-2 py-2">
        <Text className="text-5xl">{def?.icon ?? '✨'}</Text>
        <Text className="text-center text-sm text-muted">
          Quantidade no inventário: {item.quantity}
        </Text>
        {def?.durationMinutes ? (
          <Text className="text-center text-xs text-gold">
            Duração: {def.durationMinutes >= 60 ? `${def.durationMinutes / 60}h` : `${def.durationMinutes} min`}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
};
