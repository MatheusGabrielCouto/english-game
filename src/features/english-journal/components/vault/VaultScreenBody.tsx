import { type ReactNode } from 'react';
import { View } from 'react-native';

import type { VaultHubKey } from '../../constants/vault-ui';
import { VaultHubNav } from '../VaultHubNav';
import { VaultGlobalSearchTrigger } from './VaultGlobalSearchTrigger';
import { VaultHelpCard } from './VaultHelpCard';

type VaultScreenBodyProps = {
  hubActive: VaultHubKey;
  hubLinkMode?: 'tab' | 'stack';
  helpText?: string;
  helpDefaultOpen?: boolean;
  showHelp?: boolean;
  children: ReactNode;
};

export const VaultScreenBody = ({
  hubActive,
  hubLinkMode = 'tab',
  helpText,
  helpDefaultOpen = false,
  showHelp = true,
  children,
}: VaultScreenBodyProps) => (
  <View className="gap-4">
    <VaultHubNav active={hubActive} linkMode={hubLinkMode} />
    <VaultGlobalSearchTrigger />
    {showHelp && helpText ? (
      <VaultHelpCard body={helpText} defaultOpen={helpDefaultOpen} />
    ) : null}
    {children}
  </View>
);
