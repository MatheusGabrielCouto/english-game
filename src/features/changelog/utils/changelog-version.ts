const parseVersionParts = (version: string): number[] =>
  version.split('.').map((part) => {
    const parsed = Number.parseInt(part, 10)
    return Number.isFinite(parsed) ? parsed : 0
  })

/** Returns 1 if `left` is newer, -1 if older, 0 if equal. */
export const compareVersions = (left: string, right: string): number => {
  const leftParts = parseVersionParts(left)
  const rightParts = parseVersionParts(right)
  const length = Math.max(leftParts.length, rightParts.length, 3)

  for (let index = 0; index < length; index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0)
    if (diff !== 0) return diff > 0 ? 1 : -1
  }

  return 0
}

export const isVersionNewer = (current: string, lastSeen: string): boolean =>
  compareVersions(current, lastSeen) > 0
