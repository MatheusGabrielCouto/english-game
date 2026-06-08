import { eq } from 'drizzle-orm'

import { getDb } from '@/storage/database/client'
import { learningMonthlyReports } from '@/storage/database/schema'
import type { LearningMonthlyReport } from '@/types/learning-gps'

const nowIso = () => new Date().toISOString()

export const LearningIntelligenceRepository = {
  async findByMonthKey(monthKey: string): Promise<LearningMonthlyReport | null> {
    const db = getDb()
    const rows = await db
      .select()
      .from(learningMonthlyReports)
      .where(eq(learningMonthlyReports.monthKey, monthKey))
      .limit(1)

    if (!rows[0]) return null
    return JSON.parse(rows[0].reportJson) as LearningMonthlyReport
  },

  async saveReport(report: LearningMonthlyReport): Promise<LearningMonthlyReport> {
    const db = getDb()
    const updatedAt = nowIso()

    await db
      .insert(learningMonthlyReports)
      .values({
        monthKey: report.monthKey,
        generatedAt: report.generatedAt,
        reportJson: JSON.stringify(report),
        updatedAt,
      })
      .onConflictDoUpdate({
        target: learningMonthlyReports.monthKey,
        set: {
          generatedAt: report.generatedAt,
          reportJson: JSON.stringify(report),
          updatedAt,
        },
      })

    return report
  },
}
