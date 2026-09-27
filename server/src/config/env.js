import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({ quiet: true })

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be an email address'),
  ADMIN_PASSWORD_HASH: z.string().startsWith('$2', 'ADMIN_PASSWORD_HASH must be a bcrypt hash (run npm run hash-password)'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment variables:')
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  CLIENT_ORIGINS: parsed.data.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
}
