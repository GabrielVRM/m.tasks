import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../../controllers/get-week-peding-goals'


export const getPedingGoalRoute: FastifyPluginAsyncZod = async app => {
  app.get('/pending-goals', async reply => {
    const { pendingGoals } = await getWeekPendingGoals()

    return pendingGoals
  })
}
