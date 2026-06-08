import { Text, View } from 'react-native';

import { Modal } from '@/components';

import { CONTRACT_MESSAGES } from '../constants/default-contracts';
import type { UseContractsReturn } from '../hooks/use-contracts';
import { getIssuerPoiLabel } from '../utils/eligibility';

type ContractAcceptModalProps = {
  contracts: UseContractsReturn;
};

const BalanceRow = ({
  label,
  value,
  valueClassName = 'text-foreground',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <View className="gap-1 border-b border-border/60 py-2.5 last:border-b-0">
    <Text className="text-xs text-foreground-secondary">{label}</Text>
    <Text className={` font-bold ${valueClassName}`} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export const ContractAcceptModal = ({ contracts }: ContractAcceptModalProps) => {
  const {
    coins,
    selectedContractKey,
    getDefinition,
    canAfford,
    handleCancelAccept,
    handleConfirmAccept,
  } = contracts;

  const definition = selectedContractKey ? getDefinition(selectedContractKey) : undefined;

  if (!definition) return null;

  const affordable = canAfford(definition);
  const remaining = coins - definition.stakeAmount;
  const issuer = getIssuerPoiLabel(definition.issuerPoiKey);

  return (
    <Modal
      visible
      onRequestClose={handleCancelAccept}
      title={CONTRACT_MESSAGES.acceptTitle}
      description={CONTRACT_MESSAGES.acceptDescription}
      confirmLabel="Confirmar aposta"
      cancelLabel="Cancelar"
      onConfirm={affordable ? handleConfirmAccept : undefined}
      onCancel={handleCancelAccept}>
      <View className="gap-4 py-2">
        <View className="items-center gap-2">
          <Text className="text-4xl">{definition.icon}</Text>
          <Text className="text-center text-lg font-bold text-foreground" numberOfLines={2}>
            {definition.name}
          </Text>
          <Text className="px-2 text-center text-sm leading-5 text-foreground-secondary">
            {definition.objective}
          </Text>
          <Text className="text-xs text-muted">{definition.targetDays} dias · {definition.stakeAmount} 🪙</Text>
          <Text className="text-xs text-foreground-secondary">
            {CONTRACT_MESSAGES.issuerLabel}: {issuer.icon} {issuer.name}
          </Text>
        </View>

        <View className="rounded-xl border border-border bg-surface-elevated px-4 py-1">
          <BalanceRow
            label={CONTRACT_MESSAGES.stakeLabel}
            value={`${definition.stakeAmount.toLocaleString('pt-BR')} 🪙`}
            valueClassName="text-accent"
          />
          <BalanceRow label="Saldo atual" value={`${coins.toLocaleString('pt-BR')} 🪙`} />
          <BalanceRow
            label="Saldo após aposta"
            value={affordable ? `${remaining.toLocaleString('pt-BR')} 🪙` : 'Insuficiente'}
            valueClassName={affordable ? 'text-foreground' : 'text-danger'}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground-secondary">
            {CONTRACT_MESSAGES.rewardLabel}
          </Text>
          {definition.rewards.map((reward) => (
            <View
              key={reward.label}
              className="flex-row gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <Text className="text-accent">✦</Text>
              <Text className="min-w-0 flex-1 text-sm text-foreground" numberOfLines={2}>
                {reward.label}
              </Text>
            </View>
          ))}
        </View>

        {!affordable ? (
          <Text className="text-center text-sm text-danger">{CONTRACT_MESSAGES.insufficientCoins}</Text>
        ) : null}
      </View>
    </Modal>
  );
};
