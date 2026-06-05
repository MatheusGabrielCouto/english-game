import { FeatureErrorBoundary } from '@/components/layout';
import { PetScreen } from '@/features/pet';

export default function PetRoute() {
  return (
    <FeatureErrorBoundary feature="pet">
      <PetScreen />
    </FeatureErrorBoundary>
  );
}
