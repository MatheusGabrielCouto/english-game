export type HowItWorksScreenKey =
  | 'achievements'
  | 'city'
  | 'collection-book'
  | 'contracts'
  | 'prestige'
  | 'shields'
  | 'titles'
  | 'vault-collections'
  | 'vault-library'
  | 'vault-map'
  | 'vault-spaces'

export const HOW_IT_WORKS_SCREEN_KEYS = [
  'achievements',
  'city',
  'collection-book',
  'contracts',
  'prestige',
  'shields',
  'titles',
  'vault-collections',
  'vault-library',
  'vault-map',
  'vault-spaces',
] as const satisfies readonly HowItWorksScreenKey[]

export const howItWorksStorageKey = (key: HowItWorksScreenKey) => `eq:how-it-works-seen:${key}`
