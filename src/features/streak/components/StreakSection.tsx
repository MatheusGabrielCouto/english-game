import { Text, View } from 'react-native';

import { useStudyHistory } from '../hooks/use-study-history';
import { StudyCalendar } from './StudyCalendar';
import { StudyHistoryList } from './StudyHistoryList';

export const StreakSection = () => {
  const { recentDays, monthStudyDays, loadHistory } = useStudyHistory();

  return (
    <View className="gap-4">
      <StudyCalendar
        studiedDays={monthStudyDays}
        onMonthChange={(year, month) => {
          void loadHistory(year, month);
        }}
      />
      <StudyHistoryList studyDays={recentDays} />
    </View>
  );
};
