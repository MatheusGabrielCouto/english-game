import { FeatureErrorBoundary } from '@/components/layout';
import { CityScreen } from '@/features/city';

export default function CityRoute() {
  return (
    <FeatureErrorBoundary feature="city">
      <CityScreen />
    </FeatureErrorBoundary>
  );
}
