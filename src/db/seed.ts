// popular o BD com dados ficticioa, para não começa a app sem dados no Bd!
import { client, db } from '.'
import { goalCompletions, goals, users } from './schema'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)
  await db.delete(users)

  const result = await db
    .insert(goals)
    .values([
      { title: 'acordar cedo', desiredWeeklyFrequency: 5 },
      { title: 'gym', desiredWeeklyFrequency: 4 },
      { title: 'oração', desiredWeeklyFrequency: 7 },
      { title: 'meditar', desiredWeeklyFrequency: 2 },
    ])
    .returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: result[0].id, createAt: startOfWeek.add(3, 'day').toDate() },
    { goalId: result[1].id, createAt: startOfWeek.add(4, 'day').toDate() },
  ])
  await db.insert(users).values({
    id: 1,
    name: 'Gabriel Vieira',
    email: 'gabriel.teste@gmail.com',
    password: '59710674',
    token: '123',
    createAt: startOfWeek.add(4, 'day').toDate(),
  })
}

seed().finally(() => {
  client.end()
})
