import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    buildMotivationDailyNotificationId,
    buildMotivationEveningNotificationId,
    buildMotivationSparkDeepLinkPath,
    resolveMotivationNotificationScheduleTime,
    shouldScheduleMotivationEveningNotification,
    shouldScheduleMotivationNotification,
} from '../motivation-notification-scheduling'

describe('motivation notification scheduling', () => {
  it('builds stable daily identifier per date key', () => {
    assert.equal(buildMotivationDailyNotificationId('2026-06-08'), 'eq-motivation-daily-2026-06-08')
    assert.equal(buildMotivationDailyNotificationId('2026-06-08'), 'eq-motivation-daily-2026-06-08')
    assert.equal(
      buildMotivationEveningNotificationId('2026-06-08'),
      'eq-motivation-evening-2026-06-08',
    )
  })

  it('builds spark deep link path', () => {
    assert.equal(buildMotivationSparkDeepLinkPath('spark_1'), '/motivation/spark_1')
  })

  it('pushes trigger forward when preferred time already passed', () => {
    const referenceDate = new Date(2026, 5, 8, 20, 0, 0)
    const trigger = resolveMotivationNotificationScheduleTime({
      preferredHour: 7,
      preferredMinute: 0,
      referenceDate,
    })

    assert.equal(trigger.getHours(), 20)
    assert.equal(trigger.getMinutes(), 2)
  })

  it('keeps same preferred time when still in the future', () => {
    const referenceDate = new Date(2026, 5, 8, 6, 0, 0)
    const trigger = resolveMotivationNotificationScheduleTime({
      preferredHour: 7,
      preferredMinute: 30,
      referenceDate,
    })

    assert.equal(trigger.getHours(), 7)
    assert.equal(trigger.getMinutes(), 30)
  })

  it('requires feature and global toggles before scheduling', () => {
    const future = new Date('2026-06-08T23:00:00')
    const triggerDate = new Date('2026-06-09T07:00:00')

    assert.equal(
      shouldScheduleMotivationNotification({
        globalEnabled: false,
        motivationSparkEnabled: true,
        featureEnabled: true,
        dailyNotification: true,
        hasActiveSparks: true,
        triggerDate,
        referenceDate: future,
      }),
      false,
    )

    assert.equal(
      shouldScheduleMotivationNotification({
        globalEnabled: true,
        motivationSparkEnabled: true,
        featureEnabled: true,
        dailyNotification: true,
        hasActiveSparks: true,
        triggerDate,
        referenceDate: future,
      }),
      true,
    )
  })

  it('requires evening toggle before scheduling night reminder', () => {
    const future = new Date('2026-06-08T12:00:00')
    const triggerDate = new Date('2026-06-08T20:00:00')

    assert.equal(
      shouldScheduleMotivationEveningNotification({
        globalEnabled: true,
        motivationSparkEnabled: true,
        featureEnabled: true,
        eveningNotification: false,
        hasActiveSparks: true,
        triggerDate,
        referenceDate: future,
      }),
      false,
    )

    assert.equal(
      shouldScheduleMotivationEveningNotification({
        globalEnabled: true,
        motivationSparkEnabled: true,
        featureEnabled: true,
        eveningNotification: true,
        hasActiveSparks: true,
        triggerDate,
        referenceDate: future,
      }),
      true,
    )
  })
})
