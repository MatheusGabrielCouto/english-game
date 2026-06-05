export const parseTraitKeysJson = (json: string | null | undefined): string[] => {
  if (!json || json === '[]') return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((k): k is string => typeof k === 'string' && k.length > 0);
  } catch {
    return [];
  }
};

export const serializeTraitKeys = (keys: string[]): string => JSON.stringify(keys.slice(0, 4));
