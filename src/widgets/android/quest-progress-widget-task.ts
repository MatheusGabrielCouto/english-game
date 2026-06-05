import { registerWidgetTaskHandler } from 'react-native-android-widget'

import { QUEST_PROGRESS_WIDGET_NAME } from './constants'
import { renderQuestProgressWidget } from './QuestProgressWidget'
import { EMPTY_WIDGET_SNAPSHOT, loadWidgetSnapshot } from './widget-snapshot'

registerWidgetTaskHandler(async ({ renderWidget }) => {
  const snapshot = await loadWidgetSnapshot()
  renderWidget(renderQuestProgressWidget(snapshot.updatedAt ? snapshot : EMPTY_WIDGET_SNAPSHOT))
})

export const questProgressWidgetTaskName = QUEST_PROGRESS_WIDGET_NAME
