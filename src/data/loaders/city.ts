import type { CityDistrictDefinition, CityPoiDefinition } from '@/types/city-map';
import cityJson from '../city.json';

type CityDataFile = {
  version: number;
  districts: CityDistrictDefinition[];
  pois: CityPoiDefinition[];
};

const cityData = cityJson as CityDataFile;

export const CITY_DISTRICT_CATALOG = cityData.districts;

export const CITY_POI_CATALOG = cityData.pois;

export const CITY_POIS_BY_KEY = Object.fromEntries(
  CITY_POI_CATALOG.map((poi) => [poi.poiKey, poi]),
) as Record<string, CityPoiDefinition>;

export const CITY_DISTRICTS_BY_KEY = Object.fromEntries(
  CITY_DISTRICT_CATALOG.map((district) => [district.districtKey, district]),
) as Record<string, CityDistrictDefinition>;
