import type { CityResourceTypeValue, PoiProjectDefinition } from '@/types/city-resource';
import type { ProjectBlueprint } from '@/types/lexicon-brick';
import poiProjectsJson from '../poi-projects.json';

type PoiProjectJson = {
  projectKey: string;
  poiKey: string;
  title: string;
  description: string;
  resourceType: string;
  targetTotal: number;
  deliveryChunk: number;
  minLocalLevel: number;
  localXpOnComplete: number;
  vitalityOnComplete: number;
  blueprint?: ProjectBlueprint;
};

type PoiProjectsDataFile = {
  version: number;
  projects: PoiProjectJson[];
};

const data = poiProjectsJson as PoiProjectsDataFile;

export const POI_PROJECT_DEFINITIONS: PoiProjectDefinition[] = data.projects.map((raw) => ({
  ...raw,
  resourceType: raw.resourceType as CityResourceTypeValue,
}));

export const POI_PROJECTS_BY_POI = POI_PROJECT_DEFINITIONS.reduce<
  Record<string, PoiProjectDefinition[]>
>((acc, project) => {
  const list = acc[project.poiKey] ?? [];
  list.push(project);
  acc[project.poiKey] = list;
  return acc;
}, {});

export const POI_PROJECTS_BY_KEY = Object.fromEntries(
  POI_PROJECT_DEFINITIONS.map((project) => [project.projectKey, project]),
) as Record<string, PoiProjectDefinition>;
