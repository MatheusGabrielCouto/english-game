import {
  CITY_MAP_PIN_BOUNDS_HEIGHT,
  CITY_MAP_PIN_BOUNDS_WIDTH,
  CITY_MAP_VIEWPORT_CULL_PADDING,
  type CityMapScrollViewport,
  type CityMapVisibleRect,
} from '../constants/city-map-viewport-ui'

export const shouldCullCityMapViewport = (
  canvasWidth: number,
  canvasHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): boolean => canvasWidth > viewportWidth || canvasHeight > viewportHeight

export const getPaddedViewportRect = (
  viewport: CityMapScrollViewport,
  padding: number,
  canvasWidth: number,
  canvasHeight: number,
): CityMapVisibleRect => {
  const left = Math.max(0, viewport.x - padding)
  const top = Math.max(0, viewport.y - padding)
  const right = Math.min(canvasWidth, viewport.x + viewport.width + padding)
  const bottom = Math.min(canvasHeight, viewport.y + viewport.height + padding)

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

export const isRectVisibleInViewport = (
  rect: CityMapVisibleRect,
  paddedViewport: CityMapVisibleRect,
): boolean =>
  rect.left < paddedViewport.left + paddedViewport.width &&
  rect.left + rect.width > paddedViewport.left &&
  rect.top < paddedViewport.top + paddedViewport.height &&
  rect.top + rect.height > paddedViewport.top

export const filterRectsInViewport = <T extends CityMapVisibleRect>(
  items: T[],
  viewport: CityMapScrollViewport,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = CITY_MAP_VIEWPORT_CULL_PADDING,
): T[] => {
  const paddedViewport = getPaddedViewportRect(viewport, padding, canvasWidth, canvasHeight)
  return items.filter((item) => isRectVisibleInViewport(item, paddedViewport))
}

export const filterPoiPlacementsInViewport = <T extends { left: number; top: number }>(
  placements: T[],
  viewport: CityMapScrollViewport,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = CITY_MAP_VIEWPORT_CULL_PADDING,
): T[] => {
  const paddedViewport = getPaddedViewportRect(viewport, padding, canvasWidth, canvasHeight)

  return placements.filter((placement) =>
    isRectVisibleInViewport(
      {
        left: placement.left,
        top: placement.top,
        width: CITY_MAP_PIN_BOUNDS_WIDTH,
        height: CITY_MAP_PIN_BOUNDS_HEIGHT,
      },
      paddedViewport,
    ),
  )
}
