export const CHANGELOG_UI = {
  sectionTitle: 'Novidades',
  versionLabel: (version: string) => `v${version}`,
  dismissCta: 'Entendi',
  dismissAccessibility: 'Dispensar novidades desta versão',
} as const

export const CHANGELOG_STORAGE_KEY = 'eq:changelog-last-seen-version'
