import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)

// o meu envSchema.parse, está garantido, que os dados que ele receberá do process.env é identico aou passado no envSchema
// caso contrario dara erro!!
