import { db } from '../db'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import dayjs from 'dayjs'
import { goalCompletions, goals } from '../db/schema'

interface CreateGoalRequest {
  title: string
  desiredWeeklyFrequency: number
  user_id: string
}

interface CreateGoalCompletionsRequest {
  goalId: string
}

interface DeleteGoalRequest {
  id: string
}

export async function createGoal({
  title,
  desiredWeeklyFrequency,
  user_id,
}: CreateGoalRequest) {
  try {
    const [goal] = await db
      .insert(goals)
      .values({
        title,
        desiredWeeklyFrequency,
        userId: user_id,
      })
      .returning()

    return { goal }
  } catch (error) {
    console.log(error)
  }
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

export async function deleteGoals(id: string) {
  if (!id) {
    throw new Error("O 'id' deve ser fornecido.")
  }

  const verifyExistsGoalsCompletions = await db
    .select()
    .from(goalCompletions)
    .where(eq(goalCompletions.id, id))

  await db.delete(goalCompletions).where(eq(goalCompletions.id, id))

  const goalId = verifyExistsGoalsCompletions[0].goalId
  const verifyTaskInGoalCompletions = await db
    .select()
    .from(goalCompletions)
    .where(eq(goalCompletions.goalId, goalId))
  console.log(goalId)
  console.log(verifyTaskInGoalCompletions)
  if (verifyTaskInGoalCompletions.length === 0) {
    await db.delete(goals).where(eq(goals.id, goalId))
    return { message: 'OK!' }
  }

  return { message: 'metas já removidas!!' }
}
