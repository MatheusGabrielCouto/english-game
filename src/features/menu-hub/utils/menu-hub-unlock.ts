import type { MenuHubItemDef } from '../constants/menu-hub-catalog'

export const isMenuHubItemUnlocked = (item: MenuHubItemDef, playerLevel: number): boolean =>
  item.requiredLevel == null || playerLevel >= item.requiredLevel

export const getMenuHubUnlockLabel = (requiredLevel: number): string => `Nv. ${requiredLevel}`
