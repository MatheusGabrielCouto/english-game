import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmLeagueScreenContent } from '@/features/pet-farm/components/PetFarmLeagueScreenContent';
import { PET_LEAGUE_UI } from '@/features/pet-farm/constants/pet-league-ui';

export default function PetFarmLeagueRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title="Liga dos Pets" subtitle={PET_LEAGUE_UI.subtitle} />
      <View className="pt-2">
        <PetFarmLeagueScreenContent />
      </View>
    </ScreenContainer>
  );
}
