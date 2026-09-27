import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import { publicProjects, adminProjects } from './routes/project.routes.js'
import { errorHandler, notFound } from './middleware/error.js'

export const app = express()

app.set('trust proxy', 1) // Render / Netlify sit behind one proxy
app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin tools (curl, Postman) and the configured frontends
      if (!origin || env.CLIENT_ORIGINS.includes(origin)) return cb(null, true)
      cb(null, false)
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }),
)
app.use(express.json({ limit: '50kb' }))
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }),
)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: Math.round(process.uptime()) }))
app.use('/api/auth', authRoutes)
app.use('/api/projects', publicProjects)
app.use('/api/admin/projects', adminProjects)

app.use(notFound)
app.use(errorHandler)
