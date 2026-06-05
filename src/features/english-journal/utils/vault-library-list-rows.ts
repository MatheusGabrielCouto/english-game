import type { JournalEntryRecord } from '@/types/journal'

import { VAULT_UI } from '../constants/vault-ui'

export type VaultLibraryListRow =
  | {
      kind: 'section'
      key: string
      emoji: string
      title: string
      hint?: string
      trailing?: string
    }
  | {
      kind: 'entry'
      key: string
      entry: JournalEntryRecord
      compact?: boolean
      showReview?: boolean
    }

type BuildVaultLibraryListRowsInput = {
  dueReviews: JournalEntryRecord[]
  pinned: JournalEntryRecord[]
  mainEntries: JournalEntryRecord[]
  favorites: JournalEntryRecord[]
  includeFavorites: boolean
  recentSectionTitle?: string
}

export const countVaultLibraryEntryRows = (rows: VaultLibraryListRow[]): number =>
  rows.filter((row) => row.kind === 'entry').length

export const buildVaultLibraryListRows = ({
  dueReviews,
  pinned,
  mainEntries,
  favorites,
  includeFavorites,
  recentSectionTitle = VAULT_UI.sectionRecent,
}: BuildVaultLibraryListRowsInput): VaultLibraryListRow[] => {
  const rows: VaultLibraryListRow[] = []

  if (dueReviews.length > 0) {
    rows.push({
      kind: 'section',
      key: 'section-reviews',
      emoji: '🔔',
      title: VAULT_UI.sectionReviews,
      hint: VAULT_UI.sectionReviewsHint,
      trailing: String(dueReviews.length),
    })
    for (const entry of dueReviews.slice(0, 5)) {
      rows.push({
        kind: 'entry',
        key: `review-${entry.id}`,
        entry,
        showReview: true,
      })
    }
  }

  if (pinned.length > 0) {
    rows.push({
      kind: 'section',
      key: 'section-pinned',
      emoji: '📌',
      title: VAULT_UI.sectionPinned,
      hint: VAULT_UI.sectionPinnedHint,
    })
    for (const entry of pinned) {
      rows.push({ kind: 'entry', key: `pinned-${entry.id}`, entry })
    }
  }

  if (mainEntries.length > 0) {
    rows.push({
      kind: 'section',
      key: 'section-recent',
      emoji: '🕐',
      title: recentSectionTitle,
    })
    for (const entry of mainEntries) {
      rows.push({ kind: 'entry', key: `recent-${entry.id}`, entry })
    }
  }

  if (includeFavorites && favorites.length > 0) {
    rows.push({
      kind: 'section',
      key: 'section-favorites',
      emoji: '⭐',
      title: VAULT_UI.sectionFavorites,
    })
    for (const entry of favorites.slice(0, 4)) {
      rows.push({
        kind: 'entry',
        key: `favorite-${entry.id}`,
        entry,
        compact: true,
      })
    }
  }

  return rows
}
