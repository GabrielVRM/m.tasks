import { createGoal } from '../../controllers/create-goal'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

interface CreateGoalBody {
  title: string
  desiredWeeklyFrequency: number
}

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
  app.post('/goals', async (request, reply) => {
    const { title, desiredWeeklyFrequency }: CreateGoalBody = request.body

    if (desiredWeeklyFrequency < 1 || desiredWeeklyFrequency > 7) {
      throw new Error(
        'please, put in numbers between 1 and 7 representation days of in weeks'
      )
    }

    if (!title) throw new Error('please, put title in request')
    const { goal } = await createGoal({
      title,
      desiredWeeklyFrequency,
    })

    return { goalId: goal.id }
  })
}
