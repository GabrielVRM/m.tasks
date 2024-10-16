import fastify from 'fastify'
import fastifyCors from '@fastify/cors'

import { config } from 'dotenv'

import * as showGoals from './routes/week-summary-pending.routes'
import * as users from './routes/users.routes'
import * as goals from './routes/goal.routes'

import { sessionRoute } from './routes/session.routes'

config()

const app = fastify()

const port = Number(process.env.PORT) || 4000
console.log(port)
app.register(fastifyCors, {
  origin: '*',
})

app.register(showGoals.getWeekSummaryRoute)
app.register(showGoals.getPendingGoalRoute)

app.register(users.getUsersRoute)
app.register(users.createUsersRoute)

app.register(goals.createGoalRoute)
app.register(goals.createGoalCompletionRoute)
app.register(goals.deleteGoalsRoute)

app.register(sessionRoute)

app.listen(
  {
    port: port,
    host: '0.0.0.0',
  },
  () => {
    console.log(`Http server running! ${port}`)
  }
)
