import { type ReactNode } from 'react';
import { View } from 'react-native';

import { VAULT_HUB_HELP_SEEN_KEY, type VaultHubKey } from '../../constants/vault-ui';
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
}: VaultScreenBodyProps) => {
  const helpSeenKey = VAULT_HUB_HELP_SEEN_KEY[hubActive]

  return (
    <View className="gap-4">
      <VaultHubNav active={hubActive} linkMode={hubLinkMode} />
      <VaultGlobalSearchTrigger />
      {showHelp && helpText && helpSeenKey ? (
        <VaultHelpCard
          seenKey={helpSeenKey}
          body={helpText}
          defaultOpen={helpDefaultOpen}
        />
      ) : null}
      {children}
    </View>
  )
}
