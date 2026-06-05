import { FeatureErrorBoundary } from '@/components/layout';
import { FarmScreen } from '@/features/farm/components/FarmScreen';

export default function FarmRoute() {
  return (
    <FeatureErrorBoundary feature="farm">
      <FarmScreen />
    </FeatureErrorBoundary>
  );
}
