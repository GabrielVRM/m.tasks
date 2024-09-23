import { defineConfig } from 'drizzle-kit'
import { env } from './src/env'
import path from 'node:path'

export default defineConfig({
  schema: path.join(__dirname, './src/db/schema.ts'), // Caminho absoluto
  out: './.migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
