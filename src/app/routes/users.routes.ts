import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import * as users from '../../controllers/users.controller'

interface RequestCreateUsersRoutes {
  name: string
  email: string
  password: string
}

export const createUsersRoute: FastifyPluginAsyncZod = async app => {
  app.post('/users', async (req, reply) => {
    const { name, email, password }: RequestCreateUsersRoutes =
      req.body as RequestCreateUsersRoutes
    try {
      if (!name || !email || !password) {
        throw new Error('erro ao criar o usuario, verifique seus dados! ')
      }
      await users.createUsers({ name, email, password })
    } catch (error) {
      console.log(error)
    }
    return reply.status(200).send({ message: 'criado com sucesso 🚀' })
  })
}

export const getUsersRoute: FastifyPluginAsyncZod = async app => {
  app.get('/users', users.getUsers)
}
