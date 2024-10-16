import { db } from '../db'
import { users } from '../db/schema'

import bcrypt from 'bcrypt'
const saltRounds = 4

interface RequestCreateUsers {
  name: string
  email: string
  password: string
}

export async function createUsers({
  name,
  email,
  password,
}: RequestCreateUsers) {
  try {
    const hashPassword = await bcrypt.hash(password, saltRounds)
    console.log(hashPassword)
    await db
      .insert(users)
      .values({
        name,
        email,
        password: hashPassword,
      })
      .returning()
  } catch (error) {
    throw new Error(`error${error}`)
  }
}

export async function getUsers() {
  const result = await db.select().from(users)
  return result
}
