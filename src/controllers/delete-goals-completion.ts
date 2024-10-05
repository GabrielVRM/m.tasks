import { eq } from 'drizzle-orm'
import { db } from '../db'
import { goals, goalCompletions } from '../db/schema'

interface CreateGoalRequest {
  id: string
}

export async function deleteGoals(id: CreateGoalRequest) {
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
