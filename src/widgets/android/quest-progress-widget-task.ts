import { registerWidgetTaskHandler } from 'react-native-android-widget'

import { QUEST_PROGRESS_WIDGET_NAME } from './constants'
import { renderQuestProgressWidget } from './QuestProgressWidget'
import { EMPTY_WIDGET_SNAPSHOT, loadWidgetSnapshot } from './widget-snapshot'

registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
  if (widgetAction === 'WIDGET_DELETED') return

  const snapshot = await loadWidgetSnapshot()
  const data = snapshot.updatedAt !== EMPTY_WIDGET_SNAPSHOT.updatedAt ? snapshot : EMPTY_WIDGET_SNAPSHOT
  renderWidget(renderQuestProgressWidget(data))
})

export const questProgressWidgetTaskName = QUEST_PROGRESS_WIDGET_NAME
