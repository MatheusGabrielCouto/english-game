/** Use FlashList when a list exceeds this count (P-31). */
export const VIRTUALIZED_LIST_THRESHOLD = 20

export const VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE = {
  journalEntry: 132,
  menuHubRow: 80,
  flashCard: 92,
  inventoryHistory: 76,
  inventorySpecialItem: 100,
} as const
