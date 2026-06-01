import {
    CITY_MAP_PIN_CENTER_OFFSET_X,
    CITY_MAP_PIN_CENTER_OFFSET_Y,
} from './map-layout';

/** Grade maior = mais ruas e quarteirões. */
export const MAP_GRID_COLS = 7;
export const MAP_GRID_ROWS = 6;
export const MAP_STREET_WIDTH = 11;
export const MAP_PADDING = 8;
export const MAP_TOP_LABEL_HEIGHT = 0;
export const DISTRICT_ZONE_PADDING = 5;

export type CityBlockVariant =
  | 'plaza'
  | 'civic'
  | 'shops'
  | 'residential'
  | 'park'
  | 'office'
  | 'mixed';

export type CityBlockDef = {
  row: number;
  col: number;
  districtKey: string;
  variant: CityBlockVariant;
  label?: string;
};

const getDistrictForCell = (row: number, col: number): string => {
  if (row === 0) return 'internacional';
  if (row >= MAP_GRID_ROWS - 1) return 'negocios';
  if (row >= MAP_GRID_ROWS - 2 && col <= 2) return 'negocios';
  if (col >= MAP_GRID_COLS - 2 && row >= 2 && row < MAP_GRID_ROWS - 1) return 'estudos';
  return 'centro';
};

const getVariantForCell = (
  row: number,
  col: number,
  districtKey: string,
): CityBlockVariant => {
  if (districtKey === 'internacional') return row === 0 && col === 3 ? 'plaza' : 'office';
  if (row === 1 && col === 3 && districtKey === 'centro') return 'plaza';
  if (row === 3 && col === MAP_GRID_COLS - 1 && districtKey === 'estudos') return 'park';
  if (row === MAP_GRID_ROWS - 1 && col === 3 && districtKey === 'negocios') return 'office';

  if (districtKey === 'estudos') return row === 3 && col >= MAP_GRID_COLS - 2 ? 'park' : 'mixed';
  if (districtKey === 'negocios') return 'office';
  if (col === 0 || col === 1) return row % 2 === 0 ? 'residential' : 'shops';
  if (col >= MAP_GRID_COLS - 3) return 'shops';
  return row % 2 === 0 ? 'mixed' : 'residential';
};

const buildCityBlocks = (): CityBlockDef[] => {
  const blocks: CityBlockDef[] = [];

  for (let row = 0; row < MAP_GRID_ROWS; row += 1) {
    for (let col = 0; col < MAP_GRID_COLS; col += 1) {
      const districtKey = getDistrictForCell(row, col);
      const variant = getVariantForCell(row, col, districtKey);
      const label =
        variant === 'plaza'
          ? 'Praça'
          : row === MAP_GRID_ROWS - 1 && col === 3 && districtKey === 'negocios'
            ? 'Hub'
            : undefined;

      blocks.push({ row, col, districtKey, variant, label });
    }
  }

  return blocks;
};

export const CITY_BLOCKS = buildCityBlocks();

export const POI_GRID_ANCHORS: Record<string, { row: number; col: number }> = {
  embassy_row: { row: 0, col: 1 },
  airport_gate: { row: 0, col: 5 },
  town_hall: { row: 1, col: 3 },
  season_museum: { row: 1, col: 5 },
  central_library: { row: 2, col: 1 },
  study_cafe: { row: 2, col: 4 },
  corner_shop: { row: 3, col: 0 },
  city_park: { row: 3, col: 6 },
  coworking_hub: { row: 5, col: 3 },
};

export type DistrictZoneBounds = {
  districtKey: string;
  name: string;
  emoji: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type BlockRect = CityBlockDef & {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type MapGridLayout = {
  width: number;
  height: number;
  blockWidth: number;
  blockHeight: number;
  blocks: BlockRect[];
  horizontalStreets: Array<{ top: number; left: number; width: number; height: number }>;
  verticalStreets: Array<{ top: number; left: number; width: number; height: number }>;
};

export const computeMapGridLayout = (mapWidth: number, mapHeight: number): MapGridLayout => {
  const innerWidth = mapWidth - MAP_PADDING * 2;
  const innerHeight = mapHeight - MAP_PADDING * 2 - MAP_TOP_LABEL_HEIGHT;
  const streetW = MAP_STREET_WIDTH;

  const blockWidth = (innerWidth - (MAP_GRID_COLS - 1) * streetW) / MAP_GRID_COLS;
  const blockHeight = (innerHeight - (MAP_GRID_ROWS - 1) * streetW) / MAP_GRID_ROWS;

  const originTop = MAP_PADDING + MAP_TOP_LABEL_HEIGHT;
  const originLeft = MAP_PADDING;

  const blockLeft = (col: number) => originLeft + col * (blockWidth + streetW);
  const blockTop = (row: number) => originTop + row * (blockHeight + streetW);

  const blocks: BlockRect[] = CITY_BLOCKS.map((block) => ({
    ...block,
    left: blockLeft(block.col),
    top: blockTop(block.row),
    width: blockWidth,
    height: blockHeight,
  }));

  const horizontalStreets: MapGridLayout['horizontalStreets'] = [];
  for (let row = 0; row < MAP_GRID_ROWS - 1; row += 1) {
    horizontalStreets.push({
      left: originLeft,
      top: blockTop(row) + blockHeight,
      width: innerWidth,
      height: streetW,
    });
  }

  const verticalStreets: MapGridLayout['verticalStreets'] = [];
  for (let col = 0; col < MAP_GRID_COLS - 1; col += 1) {
    verticalStreets.push({
      left: blockLeft(col) + blockWidth,
      top: originTop,
      width: streetW,
      height: innerHeight,
    });
  }

  return {
    width: mapWidth,
    height: mapHeight,
    blockWidth,
    blockHeight,
    blocks,
    horizontalStreets,
    verticalStreets,
  };
};

export const computeDistrictZones = (
  layout: MapGridLayout,
  districts: Array<{ districtKey: string; name: string; mapEmoji: string }>,
): DistrictZoneBounds[] => {
  const pad = DISTRICT_ZONE_PADDING;

  return districts.map((district) => {
    const districtBlocks = layout.blocks.filter((b) => b.districtKey === district.districtKey);

    if (districtBlocks.length === 0) {
      return {
        districtKey: district.districtKey,
        name: district.name,
        emoji: district.mapEmoji,
        left: pad,
        top: pad,
        width: 0,
        height: 0,
      };
    }

    const left = Math.min(...districtBlocks.map((b) => b.left)) - pad;
    const top = Math.min(...districtBlocks.map((b) => b.top)) - pad;
    const right = Math.max(...districtBlocks.map((b) => b.left + b.width)) + pad;
    const bottom = Math.max(...districtBlocks.map((b) => b.top + b.height)) + pad;

    return {
      districtKey: district.districtKey,
      name: district.name,
      emoji: district.mapEmoji,
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: right - Math.max(0, left),
      height: bottom - Math.max(0, top),
    };
  });
};

export const getPoiPinPosition = (
  poiKey: string,
  layout: MapGridLayout,
  fallbackX: number,
  fallbackY: number,
): { left: number; top: number } => {
  const anchor = POI_GRID_ANCHORS[poiKey];

  if (anchor) {
    const block = layout.blocks.find((b) => b.row === anchor.row && b.col === anchor.col);
    if (block) {
      const left = Math.round(block.left + block.width / 2 - CITY_MAP_PIN_CENTER_OFFSET_X);
      const top = Math.round(block.top + block.height / 2 - CITY_MAP_PIN_CENTER_OFFSET_Y);

      return {
        left: Math.max(4, Math.min(left, layout.width - 76)),
        top: Math.max(4, Math.min(top, layout.height - 88)),
      };
    }
  }

  const left = Math.round((fallbackX / 100) * layout.width - CITY_MAP_PIN_CENTER_OFFSET_X);
  const top = Math.round((fallbackY / 100) * layout.height - CITY_MAP_PIN_CENTER_OFFSET_Y);

  return {
    left: Math.max(4, Math.min(left, layout.width - 76)),
    top: Math.max(4, Math.min(top, layout.height - 88)),
  };
};

export const BLOCK_TINT_BY_DISTRICT: Record<string, string> = {
  centro: '#1c1e28',
  estudos: '#1a2420',
  negocios: '#1a222c',
  internacional: '#1c2030',
};

export const BLOCK_TINT_BY_VARIANT: Record<CityBlockVariant, string> = {
  plaza: '#242430',
  civic: '#262838',
  shops: '#2a2620',
  residential: '#1e2028',
  park: '#1a2e24',
  office: '#222a36',
  mixed: '#1e2228',
};

export const DISTRICT_ZONE_COLORS: Record<
  string,
  { border: string; fill: string; labelBg: string; labelText: string }
> = {
  centro: {
    border: '#8ab4f866',
    fill: '#8ab4f812',
    labelBg: '#1e222cee',
    labelText: '#8ab4f8',
  },
  estudos: {
    border: '#81c99566',
    fill: '#81c99512',
    labelBg: '#1e222cee',
    labelText: '#81c995',
  },
  negocios: {
    border: '#f9ab0066',
    fill: '#f9ab0012',
    labelBg: '#1e222cee',
    labelText: '#f9ab00',
  },
  internacional: {
    border: '#c58af966',
    fill: '#c58af912',
    labelBg: '#1e222cee',
    labelText: '#c58af9',
  },
};
