import { Modal } from '@/components';
import type { ActiveCityEventViewModel } from '@/types/city-event';

import { CITY_UI } from '../constants/city-ui';

type CityEventIntroModalProps = {
  event: ActiveCityEventViewModel;
  visible: boolean;
  onClose: () => void;
};

export const CityEventIntroModal = ({ event, visible, onClose }: CityEventIntroModalProps) => (
  <Modal
    visible={visible}
    onRequestClose={onClose}
    title={`${event.emoji} ${event.name}`}
    description={event.description}
    confirmLabel={CITY_UI.eventIntroCta}
    onConfirm={onClose}
    footerMode="single"
    scrollable={false}
  />
);
