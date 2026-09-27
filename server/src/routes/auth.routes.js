import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, me } from '../controllers/auth.controller.js'
import { requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { loginInput } from '../validators/project.schema.js'

const router = Router()

// 5 failed attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
})

router.post('/login', loginLimiter, validate(loginInput), login)
router.get('/me', requireAdmin, me)

export default router
