import { FlexWidget, TextWidget } from 'react-native-android-widget'

import {
    QUEST_PROGRESS_WIDGET_NAME,
    WIDGET_COLORS,
    WIDGET_DEEP_LINK,
    WIDGET_UI,
} from './constants'
import type { QuestProgressWidgetSnapshot } from './widget-snapshot'

const widgetRootStyle = {
  flex: 1,
  flexDirection: 'column' as const,
  justifyContent: 'space-between' as const,
  backgroundColor: WIDGET_COLORS.background,
  borderWidth: 1,
  borderColor: WIDGET_COLORS.border,
  borderRadius: 20,
  padding: 14,
}

const rowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  width: 'match_parent' as const,
}

const missionCardStyle = {
  flex: 1,
  flexDirection: 'column' as const,
  justifyContent: 'center' as const,
  backgroundColor: WIDGET_COLORS.surface,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: WIDGET_COLORS.border,
  padding: 12,
  marginTop: 10,
}

const resolveMissionTitle = (snapshot: QuestProgressWidgetSnapshot): string => {
  if (snapshot.totalMissions === 0) return WIDGET_UI.noMissions
  if (snapshot.allDone) return WIDGET_UI.allDoneTitle
  return snapshot.nextMissionTitle ?? WIDGET_UI.doNow
}

const resolveMissionBody = (snapshot: QuestProgressWidgetSnapshot): string => {
  if (snapshot.totalMissions === 0) return WIDGET_UI.openApp
  if (snapshot.allDone) return WIDGET_UI.allDoneBody
  if (snapshot.nextMissionXp > 0) return WIDGET_UI.xpReward(snapshot.nextMissionXp)
  return WIDGET_UI.pending(snapshot.completedMissions, snapshot.totalMissions)
}

export const renderQuestProgressWidget = (snapshot: QuestProgressWidgetSnapshot) => (
  <FlexWidget
    clickAction="OPEN_URI"
    clickActionData={{ uri: WIDGET_DEEP_LINK }}
    accessibilityLabel={WIDGET_UI.openApp}
    style={widgetRootStyle}>
    <FlexWidget style={rowStyle}>
      <TextWidget
        text={WIDGET_UI.brand}
        style={{ fontSize: 11, fontWeight: '700', color: WIDGET_COLORS.primary }}
      />
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6 }}>
        <TextWidget text="🔥" style={{ fontSize: 14 }} />
        <TextWidget
          text={String(snapshot.currentStreak)}
          style={{ fontSize: 18, fontWeight: '700', color: WIDGET_COLORS.streak }}
        />
        <TextWidget
          text={WIDGET_UI.streakDays(snapshot.currentStreak)}
          style={{ fontSize: 10, color: WIDGET_COLORS.muted }}
        />
      </FlexWidget>
    </FlexWidget>

    <FlexWidget style={missionCardStyle}>
      <TextWidget
        text={snapshot.studiedToday ? WIDGET_UI.studiedToday : WIDGET_UI.studyPending}
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: snapshot.studiedToday ? WIDGET_COLORS.success : WIDGET_COLORS.gold,
        }}
      />
      <TextWidget
        text={resolveMissionTitle(snapshot)}
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: WIDGET_COLORS.foreground,
          marginTop: 6,
          maxLines: 2,
        }}
      />
      <FlexWidget style={{ ...rowStyle, marginTop: 8 }}>
        <TextWidget
          text={
            snapshot.totalMissions > 0
              ? WIDGET_UI.pending(snapshot.completedMissions, snapshot.totalMissions)
              : WIDGET_UI.missionSection
          }
          style={{ fontSize: 11, color: WIDGET_COLORS.muted }}
        />
        <TextWidget
          text={resolveMissionBody(snapshot)}
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: snapshot.allDone ? WIDGET_COLORS.success : WIDGET_COLORS.accent,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  </FlexWidget>
)

export const questProgressWidgetName = QUEST_PROGRESS_WIDGET_NAME
