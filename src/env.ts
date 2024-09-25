import z from "zod"
import { config } from 'dotenv';

config()

console.log(process.env.DATABASE_URL)
const envSchema = z.object({
    DATABASE_URL: z.string().url()
})

export const env = envSchema.parse(process.env)