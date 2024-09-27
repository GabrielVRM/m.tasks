import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { createGoalCompletion } from '../../controllers/create-goal-completion'

interface completions {
  goalId: string
}

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/completions',
    // {
    //   schema: {
    //     body: z.object({
    //       goalId: z.string(),
    //     }),
    //   },
    // },
    async req => {
      const { goalId }: completions = req.body
      if (!goalId) throw new Error('please, put the gaolId.')
      const result = await createGoalCompletion({
        goalId,
      })
      return result
    }
  )
}
