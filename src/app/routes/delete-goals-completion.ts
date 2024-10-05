import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { deleteGoals } from '../../controllers/delete-goals-completion'

export const deleteGoalsRoute: FastifyPluginAsyncZod = async app => {
  app.delete('/goals-delete/:id', async (req, reply) => {
    const { id } = req.params

    try {
      const result = await deleteGoals(id)
      return reply.send({ message: 'Meta deletada com sucesso', result })
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
      return reply
        .status(500)
        .send({ message: 'Erro ao deletar meta', error: error.message })
    }
  })
}
