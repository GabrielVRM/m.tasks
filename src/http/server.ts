import fastify from 'fastify'

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { createGoalRoute } from './routes/create-goal'
import { createGoalCompletionRoute } from './routes/create-goal-completion'
import { getPedingGoalRoute } from './routes/get-week-peding-goals'
import { getWeekSummaryRoute } from './routes/get-week-summary'
import fastifyCors from 'fastify-cors'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)
app.register(createGoalCompletionRoute)
app.register(getPedingGoalRoute)
app.register(getWeekSummaryRoute)

const port = process.env.PORT || 3000

app.listen(port, '0.0.0.0', err => {
  if (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
  console.log(`HTTP server running! ${port}`)
})
