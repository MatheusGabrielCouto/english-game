/** Deterministic checksum for backup integrity (Fase 18 validation). */
export const computeBackupChecksum = (payload: unknown): string => {
  const serialized = stableStringify(payload);
  let hash = 2166136261;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
};

export const buildBackupFileName = (exportedAt: string): string => {
  const stamp = exportedAt.replace(/[:.]/g, '-');
  return `english-quest-backup-${stamp}.json`;
};
