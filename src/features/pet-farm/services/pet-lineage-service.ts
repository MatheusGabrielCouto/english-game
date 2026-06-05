import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import type { PetInstance } from '@/types/pet-instance';

import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { PET_GEN_UI } from '../constants/pet-gen-ui';

export type LineageSummaryRow = {
  key: string;
  label: string;
  instance: PetInstance | null;
};

export type LineageTreeNode = {
  instance: PetInstance;
  mother: LineageTreeNode | null;
  father: LineageTreeNode | null;
};

const loadInstance = async (id: number | null | undefined): Promise<PetInstance | null> => {
  if (!id) return null;
  return PetInstanceRepository.findById(id);
};

export const canOpenLineageTree = (instance: PetInstance): boolean =>
  instance.generation >= 2 || instance.parentMotherId !== null || instance.parentFatherId !== null;

export const PetLineageService = {
  async buildSummaryRows(root: PetInstance, maxDepth = 4): Promise<LineageSummaryRow[]> {
    const rows: LineageSummaryRow[] = [];

    const mother = await loadInstance(root.parentMotherId);
    const father = await loadInstance(root.parentFatherId);

    if (maxDepth >= 1) {
      rows.push({ key: 'mother', label: PET_FARM_UI.mother, instance: mother });
      rows.push({ key: 'father', label: PET_FARM_UI.father, instance: father });
    }

    if (maxDepth >= 2) {
      const grandSlots = [
        { key: 'mm', label: 'Avó (mãe)', id: mother?.parentMotherId },
        { key: 'mf', label: 'Avô (mãe)', id: mother?.parentFatherId },
        { key: 'fm', label: 'Avó (pai)', id: father?.parentMotherId },
        { key: 'ff', label: 'Avô (pai)', id: father?.parentFatherId },
      ];
      for (const slot of grandSlots) {
        if (!slot.id) continue;
        rows.push({ key: slot.key, label: slot.label, instance: await loadInstance(slot.id) });
      }
    }

    if (maxDepth >= 3) {
      const grandparents = await Promise.all(
        [
          mother?.parentMotherId,
          mother?.parentFatherId,
          father?.parentMotherId,
          father?.parentFatherId,
        ].map((id) => loadInstance(id)),
      );

      let bisIndex = 0;
      for (const gp of grandparents) {
        if (!gp) continue;
        const bisSlots = [
          { label: 'Bisavó', id: gp.parentMotherId },
          { label: 'Bisavô', id: gp.parentFatherId },
        ];
        for (const bis of bisSlots) {
          if (!bis.id) continue;
          bisIndex += 1;
          rows.push({
            key: `bis-${bisIndex}`,
            label: `${bis.label} · ${gp.nickname}`,
            instance: await loadInstance(bis.id),
          });
        }
      }
    }

    if (maxDepth >= 4) {
      const knownIds = new Set(rows.map((r) => r.instance?.id).filter(Boolean) as number[]);
      for (const row of [...rows]) {
        const inst = row.instance;
        if (!inst) continue;
        for (const ancestorId of [inst.parentMotherId, inst.parentFatherId]) {
          if (!ancestorId || knownIds.has(ancestorId)) continue;
          knownIds.add(ancestorId);
          const ancestor = await loadInstance(ancestorId);
          if (!ancestor) continue;
          rows.push({
            key: `deep-${ancestorId}`,
            label: `Trisavô · ${ancestor.nickname}`,
            instance: ancestor,
          });
        }
      }
    }

    return rows;
  },

  async buildTree(rootId: number, maxDepth = 4): Promise<LineageTreeNode | null> {
    const buildNode = async (
      id: number,
      depth: number,
      visiting: Set<number>,
    ): Promise<LineageTreeNode | null> => {
      if (depth > maxDepth || visiting.has(id)) return null;
      const instance = await PetInstanceRepository.findById(id);
      if (!instance) return null;

      visiting.add(id);
      const mother =
        instance.parentMotherId && depth < maxDepth
          ? await buildNode(instance.parentMotherId, depth + 1, visiting)
          : null;
      const father =
        instance.parentFatherId && depth < maxDepth
          ? await buildNode(instance.parentFatherId, depth + 1, visiting)
          : null;
      visiting.delete(id);

      return { instance, mother, father };
    };

    return buildNode(rootId, 1, new Set());
  },

  unknownLabel: PET_GEN_UI.unknownAncestor,
};
