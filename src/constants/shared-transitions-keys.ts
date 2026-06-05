/**
 * Shared element tags for hero cards (source → destination).
 * Pairs (P-28):
 * - playerHero: HomePlayerHeader → ProfileIdentityHero
 * - profileAvatarHero: HomePlayerHeader avatar → ProfileIdentityHero avatar
 * - cityHero: HomeCityCard → CityHeroCard
 * - cityBuildingHero: HomeCityCard building icon → CityHeroCard building icon
 * - petHero: HomePetCompanionCard → PetHeroDisplay
 * - petFarmHero: PetFarmLink → PetFarmMapScreen island
 * - inventoryHero: (stack only) InventoryHeroCard
 * - lootHero: HomeNextRewardCard → LootBoxStatsCard
 */
export const SHARED_TRANSITION_TAGS = {
  playerHero: 'hero-player',
  profileAvatarHero: 'hero-profile-avatar',
  petHero: 'hero-pet',
  petFarmHero: 'hero-pet-farm',
  cityHero: 'hero-city',
  cityBuildingHero: 'hero-city-building',
  inventoryHero: 'hero-inventory',
  lootHero: 'hero-loot',
} as const

export type SharedTransitionTag =
  (typeof SHARED_TRANSITION_TAGS)[keyof typeof SHARED_TRANSITION_TAGS]

export const SHARED_TRANSITION_TAG_VALUES = Object.values(
  SHARED_TRANSITION_TAGS,
) as SharedTransitionTag[]

/** Reanimated 4 SET — enable via package.json `reanimated.staticFeatureFlags`. */
export const SHARED_ELEMENT_TRANSITIONS_ENABLED = true
