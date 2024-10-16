import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import bcrypt from 'bcrypt'

interface SessionRequest {
  email: string
  password: string
}

export async function session({ email, password }: SessionRequest) {
  try {
    const verifyEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    const passwordIsValid = await bcrypt.compare(
      password,
      verifyEmail[0].password
    )
    if (!verifyEmail || !passwordIsValid) {
      throw new Error(
        'E-mail ou senha incorretos, verifique seu e-mail e sua senha ⚠️'
      )
    }
    return { verifyEmail }
  } catch (error) {
    throw new Error(
      'E-mail ou senha incorretos, verifique seu e-mail e sua senha ⚠️'
    )
  }
}
