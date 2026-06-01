import {
  LearningDifficulty,
  type LearningDifficultyValue,
  isLearningDifficulty,
} from '@/features/game-design/constants/difficulty';

import { getAppSettings, saveAppSettings, type AppSettingsRecord } from './app-settings-repository';

export type { AppSettingsRecord };

export const getLearningDifficulty = async (): Promise<LearningDifficultyValue> => {
  const settings = await getAppSettings();
  if (isLearningDifficulty(settings.difficulty)) {
    return settings.difficulty;
  }
  return LearningDifficulty.BALANCED;
};

export const setLearningDifficulty = async (
  difficulty: LearningDifficultyValue,
): Promise<AppSettingsRecord> => {
  const current = await getAppSettings();
  const next = { ...current, difficulty };
  await saveAppSettings(next);
  return next;
};

export const setAvatarCustomization = async (params: {
  avatarFrame?: string;
  avatarBadge?: string | null;
}): Promise<AppSettingsRecord> => {
  const current = await getAppSettings();
  const next = {
    ...current,
    avatarFrame: params.avatarFrame ?? current.avatarFrame,
    avatarBadge: params.avatarBadge === undefined ? current.avatarBadge : params.avatarBadge,
  };
  await saveAppSettings(next);
  return next;
};
