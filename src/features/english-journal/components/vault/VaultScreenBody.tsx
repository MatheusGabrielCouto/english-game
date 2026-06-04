import { type ReactNode } from 'react';
import { View } from 'react-native';

import type { VaultHubKey } from '../../constants/vault-ui';
import { VaultHubNav } from '../VaultHubNav';
import { VaultHelpCard } from './VaultHelpCard';

type VaultScreenBodyProps = {
  hubActive: VaultHubKey;
  helpText?: string;
  helpDefaultOpen?: boolean;
  showHelp?: boolean;
  children: ReactNode;
};

export const VaultScreenBody = ({
  hubActive,
  helpText,
  helpDefaultOpen = false,
  showHelp = true,
  children,
}: VaultScreenBodyProps) => (
  <View className="gap-4">
    <VaultHubNav active={hubActive} />
    {showHelp && helpText ? (
      <VaultHelpCard body={helpText} defaultOpen={helpDefaultOpen} />
    ) : null}
    {children}
  </View>
);
