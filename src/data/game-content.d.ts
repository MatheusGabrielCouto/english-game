declare module '@/data/missions.json' {
  import type { MissionsDataFile } from '@/data/types';
  const value: MissionsDataFile;
  export default value;
}

declare module '@/data/items.json' {
  import type { ItemsDataFile } from '@/data/types';
  const value: ItemsDataFile;
  export default value;
}

declare module '@/data/poi-missions.json' {
  import type { PoiMissionTemplate } from '@/data/loaders/poi-missions';
  const value: { version: number; templates: PoiMissionTemplate[] };
  export default value;
}

declare module '@/data/city.json' {
  import type { CityDistrictDefinition, CityPoiDefinition } from '@/types/city-map';
  const value: {
    version: number;
    districts: CityDistrictDefinition[];
    pois: CityPoiDefinition[];
  };
  export default value;
}
