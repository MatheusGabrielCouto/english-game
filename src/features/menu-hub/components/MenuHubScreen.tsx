import { ScreenContainer, ScreenHeader } from '@/components/layout'

import { MENU_HUB_UI } from '../constants/menu-hub-ui'
import { MenuHubScreenContent } from './MenuHubScreenContent'

export const MenuHubScreen = () => (
  <ScreenContainer scrollable={false} contentClassName="flex-1">
    <ScreenHeader
      title={MENU_HUB_UI.screenTitle}
      subtitle={MENU_HUB_UI.screenSubtitle}
      emoji="📋"
    />
    <MenuHubScreenContent />
  </ScreenContainer>
)
