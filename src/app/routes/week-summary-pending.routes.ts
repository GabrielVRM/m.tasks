import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import * as showGoals from '../../controllers/week-summary-pending.controller'

type PendingGoalParams = {
  user_id: string
}

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
  app.get('/summary/:user_id', async request => {
    const { user_id } = request.params as PendingGoalParams

    const { summary } = await showGoals.getWeekSummary(user_id)

    return { summary }
  })
}

export const getPendingGoalRoute: FastifyPluginAsyncZod = async app => {
  app.get('/pending-goals/:user_id', async request => {
    const { user_id } = request.params as PendingGoalParams

    const { pendingGoals } = await showGoals.getWeekPendingGoals(user_id)
    return pendingGoals
  })
}
