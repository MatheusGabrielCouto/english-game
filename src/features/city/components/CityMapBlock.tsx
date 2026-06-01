import { StyleSheet, Text, View } from 'react-native';

import type { CityBlockDef, CityBlockVariant } from '../constants/city-map-grid';
import { BLOCK_TINT_BY_DISTRICT, BLOCK_TINT_BY_VARIANT } from '../constants/city-map-grid';
import { CITY_MAP_GMAPS } from '../constants/city-map-styles';

type CityMapBlockProps = {
  block: CityBlockDef & { left: number; top: number; width: number; height: number };
  dimmed: boolean;
};

const BuildingFootprint = ({
  left,
  width,
  height,
  color,
}: {
  left: number;
  width: number;
  height: number;
  color: string;
}) => (
  <View
    style={{
      position: 'absolute',
      bottom: 3,
      left,
      width,
      height,
      backgroundColor: color,
      borderRadius: 2,
      borderWidth: 0.5,
      borderColor: '#3c4048',
    }}
  />
);

const BlockInteriors = ({
  variant,
  blockWidth,
  blockHeight,
}: {
  variant: CityBlockVariant;
  blockWidth: number;
  blockHeight: number;
}) => {
  const size = Math.min(blockWidth, blockHeight);

  if (variant === 'park') {
    return (
      <View style={styles.parkInterior}>
        <View style={styles.parkPatch} />
        <Text style={styles.parkTree}>🌳</Text>
      </View>
    );
  }

  if (variant === 'plaza') {
    return (
      <View style={styles.plazaInterior}>
        <View style={styles.plazaRing} />
      </View>
    );
  }

  const scale = size / 56;
  const w1 = Math.max(8, Math.round(12 * scale));
  const w2 = Math.max(6, Math.round(9 * scale));
  const h1 = Math.max(10, Math.round(18 * scale));
  const h2 = Math.max(8, Math.round(14 * scale));

  if (variant === 'office') {
    return (
      <>
        <BuildingFootprint left={4} width={w1} height={h1} color={CITY_MAP_GMAPS.buildingOffice} />
        <BuildingFootprint
          left={w1 + 7}
          width={w2}
          height={h2}
          color="#2a3444"
        />
        <BuildingFootprint
          left={w1 + w2 + 10}
          width={w1}
          height={h1 + 3}
          color="#323c4c"
        />
      </>
    );
  }

  if (variant === 'civic') {
    const civicW = w1 + 6;
    return (
      <BuildingFootprint
        left={Math.max(4, (blockWidth - civicW) / 2)}
        width={civicW}
        height={h1 + 4}
        color={CITY_MAP_GMAPS.buildingCivic}
      />
    );
  }

  if (variant === 'shops') {
    return (
      <>
        <BuildingFootprint left={3} width={w1} height={h2} color={CITY_MAP_GMAPS.buildingShop} />
        <BuildingFootprint left={w1 + 5} width={w2} height={h2 - 2} color="#342e28" />
      </>
    );
  }

  return (
    <>
      <BuildingFootprint left={5} width={w1} height={h1} color={CITY_MAP_GMAPS.building} />
      <BuildingFootprint left={w1 + 9} width={w2} height={h2} color="#1a1c24" />
    </>
  );
};

export const CityMapBlock = ({ block, dimmed }: CityMapBlockProps) => {
  const tint =
    BLOCK_TINT_BY_VARIANT[block.variant] ??
    BLOCK_TINT_BY_DISTRICT[block.districtKey] ??
    CITY_MAP_GMAPS.land;

  return (
    <View
      style={[
        styles.block,
        {
          left: block.left,
          top: block.top,
          width: block.width,
          height: block.height,
          backgroundColor: tint,
        },
        dimmed && styles.blockDimmed,
      ]}
    >
      <BlockInteriors
        variant={block.variant}
        blockWidth={block.width}
        blockHeight={block.height}
      />
      {block.label ? (
        <Text style={styles.blockLabel} numberOfLines={1}>
          {block.label}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#2e323c',
    overflow: 'hidden',
    zIndex: 2,
  },
  blockDimmed: {
    opacity: 0.55,
  },
  blockLabel: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 7,
    fontWeight: '600',
    color: CITY_MAP_GMAPS.blockLabel,
  },
  plazaInterior: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plazaRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2e323c',
    borderWidth: 1,
    borderColor: '#3c4048',
  },
  parkInterior: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkPatch: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CITY_MAP_GMAPS.landPark,
    opacity: 0.85,
  },
  parkTree: {
    fontSize: 16,
    zIndex: 1,
  },
});
