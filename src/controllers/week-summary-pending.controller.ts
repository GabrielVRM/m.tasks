import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

import { and, desc, eq, gte, lte, sql, count } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals, users } from '../db/schema'

dayjs.extend(weekOfYear)

export async function getWeekSummary(user_id: string) {
  const verifyUser = await db.select().from(users).where(eq(users.id, user_id))

  if (Array.isArray(verifyUser) && verifyUser.length === 0) {
    throw new Error('usuario não existe ⚠️')
  }
  const firstDayOfWeek = dayjs().startOf('week').toDate() // primero dia da semana
  const lastDayOfWeek = dayjs().endOf('week').toDate() // ultimo dia da semana

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        userId: goals.userId,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createAt,
      })
      .from(goals)
      .where(and(lte(goals.createAt, lastDayOfWeek), eq(goals.userId, user_id)))
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
      .innerJoin(
        goals,
        and(eq(goals.id, goalCompletions.goalId), eq(goals.userId, user_id))
      )
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
  // .where(eq(goalsCreatedUpToWeek.userId, user_id))

  return { summary: { ...result[0], goalsPerDay: result[0].goalsPerDay || {} } }
}

export async function getWeekPendingGoals(user_id: string) {
  const verifyUser = await db.select().from(users).where(eq(users.id, user_id))
  if (Array.isArray(verifyUser) && verifyUser.length === 0) {
    throw new Error('usuario não existe ⚠️')
  }
  try {
    const firstDayOfWeek = dayjs().startOf('week').toDate() // primero dia da semana
    const lastDayOfWeek = dayjs().endOf('week').toDate() // ultimo dia da semana

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
      db
        .select({
          id: goals.id,
          title: goals.title,
          desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
          userId: goals.userId,
          createdAt: goals.createAt,
        })
        .from(goals)
        .where(
          and(lte(goals.createAt, lastDayOfWeek), eq(goals.userId, user_id))
        )
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
        user_id: goalsCreatedUpToWeek.userId,
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
  } catch (error) {
    return console.log(error)
  }
}
