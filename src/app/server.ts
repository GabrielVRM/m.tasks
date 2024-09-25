import fastify from 'fastify'
import fastifyCors from '@fastify/cors'

import { config } from 'dotenv'

import { getWeekSummaryRoute } from './routes/get-week-summary'
import { getPedingGoalRoute } from './routes/get-week-peding-goals'
import { createGoalRoute } from './routes/create-goal'
import { createGoalCompletionRoute } from './routes/create-goal-completion'

config()

const app = fastify()
const port = process.env.PORT || 4000
console.log(port)
app.register(fastifyCors, {
  origin: '*',
})

app.register(getWeekSummaryRoute)
app.register(getPedingGoalRoute)
app.register(createGoalRoute)
app.register(createGoalCompletionRoute)

app.listen(port, '0.0.0.0', () => {
  console.log(`Http server running! ${port}`)
})
