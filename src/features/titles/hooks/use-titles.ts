import { useEffect } from 'react';

import { usePlayerStore } from '@/features/player';

import { TitleService } from '../services/title-service';
import { useTitlesStore } from '../store/titles-store';

export const useTitles = () => {
  const level = usePlayerStore((state) => state.level);
  const title = usePlayerStore((state) => state.title);
  const titles = useTitlesStore((state) => state.titles);
  const summary = useTitlesStore((state) => state.summary);
  const progress = useTitlesStore((state) => state.progress);
  const analytics = useTitlesStore((state) => state.analytics);
  const isLoading = useTitlesStore((state) => state.isLoading);

  useEffect(() => {
    void TitleService.refresh();
  }, [level]);

  return {
    level,
    title,
    titles,
    summary,
    progress,
    analytics,
    isLoading,
  };
};
