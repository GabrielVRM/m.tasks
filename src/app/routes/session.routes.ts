import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { session } from '../../controllers/session'
import z from 'zod'

type SessionBody = {
  email: string
  password: string
}

export const sessionRoute: FastifyPluginAsyncZod = async app => {
  app.post('/session', async (req, reply) => {
    const { email, password } = req.body as SessionBody

    try {
      return await session({ email, password })
    } catch (error) {
      return reply.status(400).send({ message: ` ${error} ❌` })
    }
  })
}
