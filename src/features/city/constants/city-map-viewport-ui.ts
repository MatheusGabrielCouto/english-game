/**
 * Viewport culling do mapa da cidade (P-44).
 * Código puro — sem imports nativos — para testes Node.
 */
export const CITY_MAP_VIEWPORT_CULL_PADDING = 48

/** Área clicável aproximada do pin (ícone + label). */
export const CITY_MAP_PIN_BOUNDS_WIDTH = 76
export const CITY_MAP_PIN_BOUNDS_HEIGHT = 88

export type CityMapScrollViewport = {
  x: number
  y: number
  width: number
  height: number
}

export type CityMapVisibleRect = {
  left: number
  top: number
  width: number
  height: number
}
