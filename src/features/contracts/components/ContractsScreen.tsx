import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { useContracts } from '../hooks/use-contracts';
import { ContractsScreenContent } from './ContractsScreenContent';

export const ContractsScreen = () => {
  const contracts = useContracts();

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title="Contratos"
        subtitle="Assuma desafios de consistência com risco e recompensa"
        emoji="📜"
      />
      <ContractsScreenContent contracts={contracts} />
    </ScreenContainer>
  );
};
