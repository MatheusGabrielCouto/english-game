/** Mesmo viewBox do `PetFarmIslandBackdrop` — posições dos prédios em coordenadas da ilha. */
export const PET_FARM_ISLAND_VIEW_W = 360;
export const PET_FARM_ISLAND_VIEW_H = 620;

export const petFarmIslandToPercent = (x: number, y: number) => ({
  leftPercent: (x / PET_FARM_ISLAND_VIEW_W) * 100,
  topPercent: (y / PET_FARM_ISLAND_VIEW_H) * 100,
});
