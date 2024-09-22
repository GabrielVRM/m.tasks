import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

dayjs.extend(weekOfYear)

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate() // primero dia da semana
  const lastDayOfWeek = dayjs().endOf('week').toDate() // ultimo dia da semana

  // commons tables
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

  const goalCompleteCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createAt, firstDayOfWeek),
          lte(goalCompletions.createAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  // with sem $, pois não é um common table express, é uma tabela, que consumira as commons tables express
  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompleteCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completeCount: sql`
      COALESCE(${goalCompleteCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalCompleteCounts,
      eq(goalCompleteCounts.goalId, goalsCreatedUpToWeek.id)
    )

  return {
    pendingGoals,
  }
}
