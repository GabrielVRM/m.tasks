import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import dayjs from 'dayjs'
import { goalCompletions, goals } from '../db/schema'

interface CreateGoalCompletionsRequest {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionsRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate() // primero dia da semana
  const lastDayOfWeek = dayjs().endOf('week').toDate() // ultimo dia da semana

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
          lte(goalCompletions.createAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalCompleteCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completeCount: sql`
      COALESCE(${goalCompleteCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompleteCounts, eq(goalCompleteCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completeCount, desiredWeeklyFrequency } = result[0]
  if (completeCount >= desiredWeeklyFrequency) {
    throw new Error('Goal alredy completed this week!')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({
      goalId,
    })
    .returning()

  const goalCompletion = insertResult[0]

  return {
    goalCompletion,
  }
}
