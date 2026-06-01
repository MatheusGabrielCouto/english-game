import { PunishmentService } from '@/features/punishments/services/punishment-service';
import { usePunishmentStore } from '@/features/punishments/store/punishment-store';

import { PunishmentImpactModal } from './PunishmentImpactModal';
import { PunishmentRecoveryModal } from './PunishmentRecoveryModal';
import { PunishmentWarningModal } from './PunishmentWarningModal';

export const PunishmentHost = () => {
  const modal = usePunishmentStore((state) => state.modal);

  const handleConfirmWarning = () => {
    void PunishmentService.confirmPendingWarning();
  };

  const handleCloseImpact = () => {
    void PunishmentService.dismissImpactModal();
  };

  const handleCloseRecovery = () => {
    void PunishmentService.dismissRecoveryModal();
  };

  return (
    <>
      <PunishmentWarningModal visible={modal === 'warning'} onConfirm={handleConfirmWarning} />
      <PunishmentImpactModal visible={modal === 'impact'} onClose={handleCloseImpact} />
      <PunishmentRecoveryModal visible={modal === 'recovery'} onClose={handleCloseRecovery} />
    </>
  );
};
