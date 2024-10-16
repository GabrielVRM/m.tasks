import { client, db } from '.'
import { goalCompletions, goals, users } from './schema'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt' // Importar bcrypt para hash da senha

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)
  await db.delete(users)

  const startOfWeek = dayjs().startOf('week')

  // Hash da senha
  const hashedPassword = await bcrypt.hash('59710674', 10)

  // Inserindo o usuário
  const user = await db
    .insert(users)
    .values({
      name: 'Gabriel Vieira',
      email: 'gabriel.teste@gmail.com',
      password: hashedPassword,
      createAt: startOfWeek.add(4, 'day').toDate(),
    })
    .returning()

  // Inserindo os objetivos
  const result = await db
    .insert(goals)
    .values([
      {
        title: 'acordar cedo',
        desiredWeeklyFrequency: 5,
        userId: user[0].id, // Use o ID do usuário inserido
      },
    ])
    .returning()

  // Inserindo as conclusões de objetivos
  await db
    .insert(goalCompletions)
    .values([
      { goalId: result[0].id, createAt: startOfWeek.add(3, 'day').toDate() },
    ])
}

seed().finally(() => {
  client.end()
})
