import type { Href } from 'expo-router'

export const routes = {
  tabs: {
    home: '/',
    play: '/(tabs)/play',
    /** @deprecated use tabs.play — redirect legado */
    quests: '/(tabs)/play',
    knowledge: '/(tabs)/knowledge',
    menu: '/(tabs)/menu',
    profile: '/(tabs)/profile',
  },
  /** Perfil em stack — entrada pela Home (avatar / identidade) */
  profile: '/profile',
  vault: {
    library: '/(tabs)/knowledge',
    spaces: '/(tabs)/knowledge/spaces',
    collections: '/(tabs)/knowledge/collections',
    map: '/(tabs)/knowledge/map',
    dashboard: '/(tabs)/knowledge/dashboard',
    search: '/(tabs)/knowledge/search',
    entryDetail: '/english-journal/entry',
    spaceDetail: '/english-journal/space',
  },
  inventory: '/inventory',
  shop: '/shop',
  pet: '/pet',
  petFarm: '/pet-farm',
  petFarmPasture: '/pet-farm/pasture',
  petFarmBarn: '/pet-farm/barn',
  petFarmIncubator: '/pet-farm/incubator',
  petFarmInstance: '/pet-farm/instance',
  petFarmUpgrades: '/pet-farm/upgrades',
  petFarmBreeding: '/pet-farm/breeding',
  petFarmEncyclopedia: '/pet-farm/encyclopedia',
  petFarmGlossary: '/pet-farm/glossary',
  petFarmAdventures: '/pet-farm/adventures',
  petFarmAcademy: '/pet-farm/academy',
  petFarmLeague: '/pet-farm/league',
  petFarmHall: '/pet-farm/hall',
  lootBoxes: '/loot-boxes',
  achievements: '/achievements',
  titles: '/titles',
  city: '/city',
  contracts: '/contracts',
  statistics: '/statistics',
  career: '/career',
  metagame: '/metagame',
  farm: '/farm',
  collectionBook: '/collection-book',
  lootBoxCatalog: '/loot-box-catalog',
  prestige: '/prestige',
  focusMode: '/focus-mode',
  focusModeSession: '/focus-mode/session',
  /** Baralho Vivo — gated by `featureFlags.flashDeckEnabled` */
  flashDeck: '/flash-deck',
  flashDeckCreate: '/flash-deck/create',
  flashDeckReview: '/flash-deck/review',
  flashDeckDeck: '/flash-deck/deck',
  flashDeckCard: '/flash-deck/card',
  /** Duelos de Inglês — gated by `featureFlags.duelsEnabled` */
  duels: '/duels',
  duelsBattle: '/duels/battle',
  duelsPatentExam: '/duels/patent-exam',
  duelsRematchReview: '/duels/rematch-review',
  learningInsights: '/learning-insights',
  routines: '/(tabs)/play?tab=routines',
  /** Entrada principal do Vault — mesma rota da aba Knowledge */
  englishJournal: '/(tabs)/knowledge',
} as const

export const playTabHref = (section: 'missions' | 'routines' = 'missions'): Href =>
  section === 'routines' ? ('/(tabs)/play?tab=routines' as Href) : routes.tabs.play

export const profileHref = (options?: { edit?: boolean }): Href =>
  options?.edit ? ('/profile?edit=1' as Href) : routes.profile

export const vaultSearchHref = (query?: string): Href => {
  const base = routes.vault.search
  if (!query?.trim()) return base
  return `${base}?q=${encodeURIComponent(query.trim())}` as Href
}

export const vaultEntryHref = (id: string): Href => `${routes.vault.entryDetail}/${id}` as Href

export const vaultSpaceHref = (key: string): Href => `${routes.vault.spaceDetail}/${key}` as Href
