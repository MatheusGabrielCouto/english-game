import { useEffect, useRef } from 'react';

import { usePlayerStore } from '@/features/player';
import { shouldSkipHydratedStoreReread } from '@/storage/startup-read-policy';

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

  const previousLevel = useRef(level);

  useEffect(() => {
    const levelChanged = previousLevel.current !== level;
    previousLevel.current = level;

    if (!levelChanged && shouldSkipHydratedStoreReread(!isLoading)) return;
    void TitleService.refresh();
  }, [isLoading, level]);

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
