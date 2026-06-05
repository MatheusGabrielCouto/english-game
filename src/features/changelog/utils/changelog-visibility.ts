import { getChangelogEntryForVersion } from '../constants/changelog-catalog'
import type { ChangelogEntry } from '../constants/changelog-catalog'
import { isVersionNewer } from './changelog-version'

export type ChangelogVisibilityInput = {
  currentVersion: string
  lastSeenVersion: string | null
}

export const resolveChangelogEntryToShow = ({
  currentVersion,
  lastSeenVersion,
}: ChangelogVisibilityInput): ChangelogEntry | null => {
  if (lastSeenVersion === null) return null

  if (lastSeenVersion === currentVersion) return null
  if (!isVersionNewer(currentVersion, lastSeenVersion)) return null

  return getChangelogEntryForVersion(currentVersion)
}

export const shouldSeedChangelogBaseline = (lastSeenVersion: string | null): boolean =>
  lastSeenVersion === null
