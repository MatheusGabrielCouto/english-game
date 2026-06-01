import { Text, View } from 'react-native';

import { Button, Card, Modal } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { PrestigeTierDefinition } from '@/types/prestige';

type PrestigeTierDetailModalProps = {
  tier: PrestigeTierDefinition | null;
  currentPrestige: number;
  playerLevel: number;
  canClaim: boolean;
  onClaim: () => void;
  onClose: () => void;
};

export const PrestigeTierDetailModal = ({
  tier,
  currentPrestige,
  playerLevel,
  canClaim,
  onClaim,
  onClose,
}: PrestigeTierDetailModalProps) => {
  if (!tier) return null;

  const unlocked = currentPrestige >= tier.level;
  const levelMet = playerLevel >= tier.requiredPlayerLevel;

  return (
    <Modal
      visible
      onRequestClose={onClose}
      cancelLabel="Fechar"
      title={`Prestígio ${tier.roman}`}>
      <View className="gap-4">
        <GameCard variant="hero">
          <Text className="text-xs font-bold uppercase tracking-widest text-accent">
            {unlocked ? 'Conquistado' : levelMet ? 'Disponível' : 'Bloqueado'}
          </Text>
          <Text className="mt-2 text-2xl font-black text-foreground">{tier.name}</Text>
          <Text className="mt-1 text-sm text-foreground-secondary">{tier.subtitle}</Text>
        </GameCard>

        <Card elevated>
          <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Requisitos</Text>
          <Text className="text-sm text-foreground">
            Nível do jogador: {tier.requiredPlayerLevel}+
          </Text>
          <Text className="mt-1 text-xs text-muted">
            Seu nível: {playerLevel} {levelMet ? '✓' : `(faltam ${tier.requiredPlayerLevel - playerLevel})`}
          </Text>
          <Text className="mt-3 text-xs leading-5 text-foreground-secondary">
            Reivindicar não zera seu nível, streak nem inventário — só adiciona recompensas e bônus permanentes.
          </Text>
        </Card>

        <Card elevated accent>
          <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Recompensas</Text>
          {tier.rewards.map((reward) => (
            <Text key={reward} className="text-sm text-foreground">
              • {reward}
            </Text>
          ))}
        </Card>

        <Card elevated>
          <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
            Benefícios Permanentes
          </Text>
          {tier.permanentBonuses.map((bonus) => (
            <View key={bonus.label} className="mb-1 flex-row justify-between">
              <Text className="text-sm text-foreground-secondary">{bonus.label}</Text>
              <Text className="text-sm font-bold text-gold">{bonus.value}</Text>
            </View>
          ))}
        </Card>

        <Card elevated>
          <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Itens Exclusivos</Text>
          <View className="flex-row flex-wrap gap-2">
            {tier.exclusiveItems.map((item) => (
              <View key={item.key} className="w-[30%] min-w-[90px] rounded-xl border border-border bg-surface px-2 py-2">
                <Text className="text-center text-xl">{item.icon}</Text>
                <Text className="mt-1 text-center text-[9px] font-bold text-foreground" numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {canClaim && currentPrestige + 1 === tier.level ? (
          <Text className="text-center text-xs text-muted">
            Use o botão &quot;Iniciar ascensão&quot; na vitrine para confirmar seu sacrifício.
          </Text>
        ) : null}
      </View>
    </Modal>
  );
};
