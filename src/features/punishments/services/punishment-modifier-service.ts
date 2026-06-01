import { usePunishmentStore } from '../store/punishment-store';
import { aggregatePenalties } from '../utils/aggregate-penalties';

export const PunishmentModifierService = {
  getAggregatedPenalties() {
    const { state, aggregated } = usePunishmentStore.getState();
    if (state) return aggregatePenalties(state.activePenalties);
    return aggregated;
  },

  getPetMoodOverride() {
    return PunishmentModifierService.getAggregatedPenalties().petMoodOverride;
  },

  getCityVibrancy() {
    return PunishmentModifierService.getAggregatedPenalties().cityVibrancy;
  },

  hasContractPenalty() {
    return PunishmentModifierService.getAggregatedPenalties().contractPenalty;
  },
};
