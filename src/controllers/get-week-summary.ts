import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

export async function getWeekSummary() {
  const firstDayOfWeek = dayjs().startOf('week').toDate() // primero dia da semana
  const lastDayOfWeek = dayjs().endOf('week').toDate() // ultimo dia da semana

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createAt,
      })
      .from(goals)
      .where(lte(goals.createAt, lastDayOfWeek))
  )

  const goalCompleteInWeek = db.$with('goal_completion_counts').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createAt,
        completedAtDate: sql`DATE(${goalCompletions.createAt})`.as(
          'completedAtDate'
        ),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createAt, firstDayOfWeek),
          lte(goalCompletions.createAt, lastDayOfWeek)
        )
      )
      .orderBy(desc(goalCompletions.createAt))
  )
  const goalsCompletedByWeekDay = db.$with('goal_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalCompleteInWeek.completedAtDate,
        completions: sql /*sql*/`
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ${goalCompleteInWeek.id},
            'title', ${goalCompleteInWeek.title},
            'completedAt', ${goalCompleteInWeek.completedAt}
      ))`.as('completions'),
      })
      .from(goalCompleteInWeek)
      .groupBy(goalCompleteInWeek.completedAtDate)
      .orderBy(desc(goalCompleteInWeek.completedAtDate))
  )

  type GoalsPerDay = Record<
    string,
    {
      id: string
      title: string
      completedAt: string
    }[]
  >
  const result = await db
    .with(goalsCreatedUpToWeek, goalCompleteInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalCompleteInWeek})`.mapWith(
        Number
      ),
      total:
        sql /*sql*/`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql /*sql*/<GoalsPerDay>`
      JSON_OBJECT_AGG(
        ${goalsCompletedByWeekDay.completedAtDate},
        ${goalsCompletedByWeekDay.completions}
      )
    `,
    })
    .from(goalsCompletedByWeekDay)

  return { summary: result[0] }
}
