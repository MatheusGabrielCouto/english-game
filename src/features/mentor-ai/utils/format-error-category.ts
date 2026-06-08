import { MentorCorrectionCategory, type MentorCorrectionCategoryValue } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

export const formatMentorErrorCategory = (category: string): string => {
  const labels = MENTOR_AI_UI.history.errorCategories
  if (category in labels) {
    return labels[category as MentorCorrectionCategoryValue]
  }
  return labels[MentorCorrectionCategory.OTHER]
}
