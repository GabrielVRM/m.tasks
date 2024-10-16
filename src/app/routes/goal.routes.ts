import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import * as goals from '../../controllers/goal.controller'

type CreateGoalBody = {
  title: string
  desiredWeeklyFrequency: number
}

type CreateGoalParms = {
  user_id: string
}

type CreateGoalCompletionRouteBody = {
  goalId: string
}

type DeleteGoalsRouteBody = {
  user_id: string
}

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
  app.post('/goals/:user_id', async (request, reply) => {
    const body = request.body as CreateGoalBody
    const params = request.params as CreateGoalParms
    const { title, desiredWeeklyFrequency } = body
    const { user_id } = params

    try {
      console.log(user_id)

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const { goal }: any = await goals.createGoal({
        title,
        desiredWeeklyFrequency,
        user_id,
      })

      return { goalId: goal.id } // Retorne o ID real do objetivo
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'An error occurred' })
    }
  })
}

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.post('/completions', async request => {
    const body = request.body as CreateGoalCompletionRouteBody
    const { goalId } = body
    if (!goalId) throw new Error('please, put the gaolId.')
    const result = await goals.createGoalCompletion({
      goalId,
    })
    return result
  })
}

export const deleteGoalsRoute: FastifyPluginAsyncZod = async app => {
  app.delete('/goals-delete/:user_id', async (request, reply) => {
    const params = request.params as DeleteGoalsRouteBody
    const { user_id } = params

    try {
      const result = await goals.deleteGoals(user_id)
      return reply.send({ message: 'Meta deletada com sucesso ✅', result })
    } catch (error) {
      console.error('Erro ao deletar meta❌: ', error)
      return reply
        .status(500)
        .send({ message: 'Erro ao deletar meta ❌', error: error })
    }
  })
}
