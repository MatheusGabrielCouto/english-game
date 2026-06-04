import type { BackupPreviewSummary, GameBackupFile } from '@/types/backup'

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

const toStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null

export const buildBackupPreview = (file: GameBackupFile): BackupPreviewSummary => {
  const player = file.tables.player[0]
  const pet = file.tables.pets[0]

  const lootBoxCount = file.tables.inventory_loot_boxes?.length ?? 0
  const specialItemCount = file.tables.inventory_special_items?.reduce(
    (sum, row) => sum + toNumber(row.quantity),
    0,
  ) ?? 0
  const shieldCount = toNumber(player?.shields)

  const petStage =
    toStringOrNull(pet?.stage) ??
    toStringOrNull(pet?.species_key) ??
    null
  const petName = toStringOrNull(pet?.name)
  const petLabel = petName ?? petStage

  return {
    playerName: file.meta.playerName ?? toStringOrNull(player?.name),
    level: toNumber(player?.level, file.meta.playerLevel ?? 1),
    xp: toNumber(player?.xp),
    coins: toNumber(player?.coins),
    streak: toNumber(player?.current_streak),
    bestStreak: toNumber(player?.best_streak),
    petLabel,
    inventoryItemCount: lootBoxCount + specialItemCount + shieldCount,
    achievementCount: file.tables.achievement_unlocks?.length ?? 0,
    routineCount: file.tables.user_routines?.length ?? 0,
    flashDeckCount: file.tables.flash_decks?.length ?? 0,
    menuFavoritesCount: file.preferences.menuHubPinnedIds.length,
    exportedAt: file.meta.exportedAt,
    appVersion: file.meta.appVersion,
    formatVersion: file.meta.formatVersion,
    totalRows: file.meta.totalRows,
  }
}
