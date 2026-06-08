import { FlexWidget, TextWidget } from 'react-native-android-widget'

import {
    QUEST_PROGRESS_WIDGET_NAME,
    WIDGET_COLORS,
    WIDGET_DEEP_LINK,
    WIDGET_UI,
} from './constants'
import type { QuestProgressWidgetSnapshot } from './widget-snapshot'

const formatCoins = (coins: number): string => {
  if (coins >= 1_000_000) return `${(coins / 1_000_000).toFixed(1)}M`
  if (coins >= 1_000) return `${(coins / 1_000).toFixed(1)}k`
  return String(coins)
}

const resolveMissionTitle = (snapshot: QuestProgressWidgetSnapshot): string => {
  if (snapshot.totalMissions === 0) return WIDGET_UI.noMissions
  if (snapshot.allDone) return WIDGET_UI.allDoneTitle
  return snapshot.nextMissionTitle ?? WIDGET_UI.doNow
}

const resolveMissionSubtitle = (snapshot: QuestProgressWidgetSnapshot): string => {
  if (snapshot.totalMissions === 0) return WIDGET_UI.openApp
  if (snapshot.allDone) return WIDGET_UI.allDoneBody
  if (snapshot.nextMissionXp > 0 || snapshot.nextMissionCoins > 0) {
    return WIDGET_UI.rewards(snapshot.nextMissionXp, snapshot.nextMissionCoins)
  }
  return WIDGET_UI.pending(snapshot.completedMissions, snapshot.totalMissions)
}

const StatTile = ({
  emoji,
  value,
  label,
  accent,
}: {
  emoji: string
  value: string
  label: string
  accent: string
}) => (
  <FlexWidget
    style={{
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: WIDGET_COLORS.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: WIDGET_COLORS.borderSoft,
      paddingVertical: 10,
      paddingHorizontal: 6,
    }}>
    <TextWidget text={emoji} style={{ fontSize: 16 }} />
    <TextWidget
      text={value}
      style={{
        fontSize: 14,
        fontWeight: '700',
        color: accent,
        marginTop: 4,
        maxLines: 1,
      }}
    />
    <TextWidget
      text={label}
      style={{ fontSize: 9, color: WIDGET_COLORS.muted, marginTop: 2, maxLines: 1 }}
    />
  </FlexWidget>
)

const XpProgressBar = ({ current, required }: { current: number; required: number }) => {
  const remaining = Math.max(required - current, 0)

  return (
    <FlexWidget style={{ width: 'match_parent', marginTop: 10 }}>
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}>
        <TextWidget
          text={WIDGET_UI.xpLevel}
          style={{ fontSize: 10, fontWeight: '600', color: WIDGET_COLORS.muted }}
        />
        <TextWidget
          text={`${current}/${required}`}
          style={{ fontSize: 10, fontWeight: '700', color: WIDGET_COLORS.foreground }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          flexDirection: 'row',
          width: 'match_parent',
          height: 12,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: WIDGET_COLORS.surface,
          marginTop: 6,
          borderWidth: 1,
          borderColor: WIDGET_COLORS.borderSoft,
        }}>
        <FlexWidget
          style={{
            flex: Math.max(current, 1),
            height: 'match_parent',
            backgroundGradient: {
              from: WIDGET_COLORS.primarySoft,
              to: WIDGET_COLORS.primary,
              orientation: 'LEFT_RIGHT',
            },
          }}
        />
        <FlexWidget style={{ flex: Math.max(remaining, 1), height: 'match_parent' }} />
      </FlexWidget>
    </FlexWidget>
  )
}

export const renderQuestProgressWidget = (snapshot: QuestProgressWidgetSnapshot) => (
  <FlexWidget
    clickAction="OPEN_URI"
    clickActionData={{ uri: WIDGET_DEEP_LINK }}
    accessibilityLabel={WIDGET_UI.openApp}
    style={{
      flex: 1,
      flexDirection: 'column',
      backgroundColor: WIDGET_COLORS.background,
      borderWidth: 1,
      borderColor: WIDGET_COLORS.border,
      borderRadius: 24,
      padding: 16,
    }}>
    <FlexWidget
      style={{
        width: 'match_parent',
        borderRadius: 18,
        padding: 14,
        backgroundGradient: {
          from: '#1a1033',
          to: WIDGET_COLORS.surfaceElevated,
          orientation: 'TOP_BOTTOM',
        },
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.35)',
      }}>
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}>
        <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
          <TextWidget
            text={WIDGET_UI.brand}
            style={{ fontSize: 12, fontWeight: '700', color: WIDGET_COLORS.primary }}
          />
          <TextWidget
            text={WIDGET_UI.greeting(snapshot.playerName)}
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: WIDGET_COLORS.foreground,
              marginTop: 4,
              maxLines: 1,
            }}
          />
          <TextWidget
            text={`${WIDGET_UI.level(snapshot.level)} · ${snapshot.playerTitle}`}
            style={{
              fontSize: 10,
              color: WIDGET_COLORS.muted,
              marginTop: 3,
              maxLines: 1,
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(251, 146, 60, 0.12)',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(251, 146, 60, 0.35)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            minWidth: 72,
          }}>
          <TextWidget text="🔥" style={{ fontSize: 18 }} />
          <TextWidget
            text={String(snapshot.currentStreak)}
            style={{ fontSize: 22, fontWeight: '700', color: WIDGET_COLORS.streak, marginTop: 2 }}
          />
          <TextWidget
            text={WIDGET_UI.streakDays(snapshot.currentStreak)}
            style={{ fontSize: 9, color: WIDGET_COLORS.muted, marginTop: 2 }}
          />
        </FlexWidget>
      </FlexWidget>

      <XpProgressBar current={snapshot.xpCurrent} required={snapshot.xpRequired} />
    </FlexWidget>

    <FlexWidget
      style={{
        flex: 1,
        width: 'match_parent',
        marginTop: 12,
        backgroundColor: WIDGET_COLORS.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: WIDGET_COLORS.borderSoft,
        padding: 14,
      }}>
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}>
        <TextWidget
          text={snapshot.allDone ? '✅' : '🎯'}
          style={{ fontSize: 16, marginRight: 6 }}
        />
        <FlexWidget style={{ flex: 1 }}>
          <TextWidget
            text={snapshot.allDone ? WIDGET_UI.allDoneTitle : WIDGET_UI.nextMission}
            style={{ fontSize: 10, fontWeight: '700', color: WIDGET_COLORS.accent }}
          />
          <TextWidget
            text={resolveMissionTitle(snapshot)}
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: WIDGET_COLORS.foreground,
              marginTop: 4,
              maxLines: 2,
            }}
          />
        </FlexWidget>
        <FlexWidget
          style={{
            backgroundColor: snapshot.studiedToday
              ? 'rgba(34, 197, 94, 0.15)'
              : 'rgba(251, 191, 36, 0.15)',
            borderRadius: 999,
            borderWidth: 1,
            borderColor: snapshot.studiedToday
              ? 'rgba(34, 197, 94, 0.35)'
              : 'rgba(251, 191, 36, 0.35)',
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}>
          <TextWidget
            text={snapshot.studiedToday ? WIDGET_UI.studiedToday : WIDGET_UI.studyPending}
            style={{
              fontSize: 9,
              fontWeight: '700',
              color: snapshot.studiedToday ? WIDGET_COLORS.success : WIDGET_COLORS.gold,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      <TextWidget
        text={resolveMissionSubtitle(snapshot)}
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: snapshot.allDone ? WIDGET_COLORS.success : WIDGET_COLORS.xp,
          marginTop: 8,
          maxLines: 1,
        }}
      />

      {snapshot.secondaryMissionTitle ? (
        <FlexWidget
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: WIDGET_COLORS.borderSoft,
            width: 'match_parent',
          }}>
          <TextWidget
            text={WIDGET_UI.alsoPending}
            style={{ fontSize: 9, fontWeight: '600', color: WIDGET_COLORS.muted }}
          />
          <TextWidget
            text={snapshot.secondaryMissionTitle}
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: WIDGET_COLORS.foreground,
              marginTop: 4,
              maxLines: 1,
            }}
          />
        </FlexWidget>
      ) : null}

      {!snapshot.allDone && snapshot.totalMissions > 0 && snapshot.remainingXpToday > 0 ? (
        <TextWidget
          text={WIDGET_UI.remainingToday(snapshot.remainingXpToday, snapshot.remainingCoinsToday)}
          style={{ fontSize: 10, color: WIDGET_COLORS.muted, marginTop: 8, maxLines: 1 }}
        />
      ) : null}
    </FlexWidget>

    <FlexWidget
      style={{
        flexDirection: 'row',
        width: 'match_parent',
        marginTop: 12,
        flexGap: 8,
      }}>
      <StatTile
        emoji="🪙"
        value={formatCoins(snapshot.coins)}
        label={WIDGET_UI.statCoins}
        accent={WIDGET_COLORS.coin}
      />
      <StatTile
        emoji="🛡️"
        value={String(snapshot.shields)}
        label={WIDGET_UI.statShields}
        accent={WIDGET_COLORS.accent}
      />
      <StatTile
        emoji="📋"
        value={
          snapshot.totalMissions > 0
            ? WIDGET_UI.pending(snapshot.completedMissions, snapshot.totalMissions)
            : '—'
        }
        label={WIDGET_UI.statMissions}
        accent={WIDGET_COLORS.primary}
      />
    </FlexWidget>
  </FlexWidget>
)

export const questProgressWidgetName = QUEST_PROGRESS_WIDGET_NAME
