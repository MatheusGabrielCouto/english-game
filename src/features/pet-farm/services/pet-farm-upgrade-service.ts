import { PlayerService } from '@/features/player/services/player-service';

import { PetFarmRepository } from '@/storage/repositories/pet-farm-repository';
import type { PetFarmFieldKey } from '@/types/pet-instance';
import { PET_FARM_FIELDS } from '../catalogs/pet-farm-catalog';

export const PetFarmUpgradeService = {
  async getFieldsWithCosts() {
    const levels = await PetFarmRepository.getFieldLevels();
    return PET_FARM_FIELDS.map((def) => {
      const level = levels[def.key];
      const atMax = level >= def.maxLevel;
      const nextLevel = level + 1;
      const cost = atMax ? 0 : def.costCoins(nextLevel);
      return { ...def, level, atMax, nextLevel, cost };
    });
  },

  async upgrade(fieldKey: PetFarmFieldKey): Promise<{ ok: boolean; message: string }> {
    const def = PET_FARM_FIELDS.find((f) => f.key === fieldKey);
    if (!def) return { ok: false, message: 'Campo inválido.' };

    const levels = await PetFarmRepository.getFieldLevels();
    const current = levels[fieldKey];
    if (current >= def.maxLevel) {
      return { ok: false, message: 'Campo já está no nível máximo.' };
    }

    const cost = def.costCoins(current + 1);
    const paid = PlayerService.removeCoins(cost);
    if (!paid) {
      return { ok: false, message: `Precisa de ${cost.toLocaleString('pt-BR')} moedas.` };
    }

    await PetFarmRepository.upgradeField(fieldKey, current + 1);
    return { ok: true, message: `${def.label} nível ${current + 1}!` };
  },
};
