import { useState } from 'react';
import { Text, View } from 'react-native';

import { PressableScale, StatPill } from '@/components/ui/game';
import { ActiveBonusesDetailModal } from '@/features/game-design/components/ActiveBonusesDetailModal';
import { RewardModifierService } from '@/features/game-design/services/reward-modifier-service';

export const ActiveBonusesCard = () => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const modifiers = RewardModifierService.getModifiersSync();

  const hasBonuses =
    modifiers.xpPercent > 0 ||
    modifiers.coinPercent > 0 ||
    modifiers.lootLuckPercent > 0 ||
    modifiers.lootBoxBonusChance > 0;

  if (!hasBonuses) return null;

  const handleOpen = () => setIsDetailOpen(true);
  const handleClose = () => setIsDetailOpen(false);

  return (
    <>
      <PressableScale
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Ver detalhes dos bônus ativos">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-widest text-foreground-secondary">
              Bônus ativos
            </Text>
            <Text className="text-[10px] font-semibold text-primary">Toque para detalhes →</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {modifiers.xpPercent > 0 ? (
              <StatPill
                layout="tile"
                className="w-[48%] min-w-[140px]"
                label="XP"
                value={`+${modifiers.xpPercent}%`}
                emoji="⚡"
                tone="primary"
              />
            ) : null}
            {modifiers.coinPercent > 0 ? (
              <StatPill
                layout="tile"
                className="w-[48%] min-w-[140px]"
                label="Moedas"
                value={`+${modifiers.coinPercent}%`}
                emoji="🪙"
                tone="gold"
              />
            ) : null}
            {modifiers.lootLuckPercent > 0 ? (
              <StatPill
                layout="tile"
                className="w-[48%] min-w-[140px]"
                label="Loot"
                value={`+${modifiers.lootLuckPercent}%`}
                emoji="🎁"
                tone="accent"
              />
            ) : null}
            {modifiers.lootBoxBonusChance > 0 ? (
              <StatPill
                layout="tile"
                className="w-[48%] min-w-[140px]"
                label="Box extra"
                value={`${Math.round(modifiers.lootBoxBonusChance * 100)}%`}
                emoji="📦"
                tone="success"
              />
            ) : null}
          </View>
        </View>
      </PressableScale>

      <ActiveBonusesDetailModal visible={isDetailOpen} onClose={handleClose} />
    </>
  );
};
