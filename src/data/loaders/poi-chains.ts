import type { PoiChainDefinition } from '@/types/city-poi-chain';
import poiChainsJson from '../poi-chains.json';

type PoiChainsFile = {
  version: number;
  chains: PoiChainDefinition[];
};

const data = poiChainsJson as PoiChainsFile;

export const POI_CHAIN_DEFINITIONS = data.chains;

export const POI_CHAINS_BY_POI = POI_CHAIN_DEFINITIONS.reduce<Record<string, PoiChainDefinition[]>>(
  (acc, chain) => {
    const list = acc[chain.poiKey] ?? [];
    list.push(chain);
    acc[chain.poiKey] = list;
    return acc;
  },
  {},
);

export const POI_CHAINS_BY_KEY = Object.fromEntries(
  POI_CHAIN_DEFINITIONS.map((chain) => [chain.chainKey, chain]),
) as Record<string, PoiChainDefinition>;
