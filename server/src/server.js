import { app } from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'

try {
  await connectDB(env.MONGODB_URI)
  app.listen(env.PORT, () => console.log(`API running on http://localhost:${env.PORT}`))
} catch (err) {
  console.error('Failed to start server:', err.message)
  process.exit(1)
}
