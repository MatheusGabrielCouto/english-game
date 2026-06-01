/** Paleta do mapa da cidade (modo escuro). */
export const CITY_MAP_GMAPS = {
  land: '#151820',
  landPark: '#1a2e24',
  landWater: '#1a2838',
  road: '#2a2e3a',
  roadBorder: '#1e222c',
  roadArterial: '#3d3848',
  roadArterialBorder: '#4a4558',
  roadLabel: '#9aa0a8',
  building: '#222630',
  buildingOffice: '#252b38',
  buildingShop: '#2a2620',
  buildingCivic: '#2a2838',
  blockLabel: '#8b9199',
  districtLabelBg: '#1e222cee',
  districtLabelText: '#8ab4f8',
  districtLabelBorder: '#3c4048',
  districtLockedOverlay: 'rgba(0, 0, 0, 0.35)',
  pinColor: '#ea4335',
  pinLocked: '#6b7280',
  markerLabelBg: '#1e222c',
  markerLabelShadow: 'rgba(0, 0, 0, 0.45)',
  markerLabelText: '#e8eaed',
} as const;

export const CITY_MAP_THEME_LAND: Record<string, string> = {
  christmas: '#141a22',
  halloween: '#1a1418',
  summer: '#181a16',
  new_year: '#161820',
};

export const STREET_LABELS_H: Record<number, string> = {
  0: 'Av. Internacional',
  2: 'Rua do Centro',
  4: 'Av. Negócios',
};

export const STREET_LABELS_V: Record<number, string> = {
  1: 'R. Biblioteca',
  3: 'R. Principal',
  5: 'R. Parque',
};
