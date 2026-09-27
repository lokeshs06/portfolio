import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError } from '../middleware/error.js'

// Compared against when the email is wrong, so both failure paths take the same time
const DUMMY_HASH = '$2b$12$bjj2lIK092v2XL4jFA2rgeKUjkNZ1eR6MXE1I2tzHI68nqtnizGsy'

export async function login(req, res, next) {
  const { email, password } = req.body
  const emailOk = email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()
  const passwordOk = await bcrypt.compare(password, emailOk ? env.ADMIN_PASSWORD_HASH : DUMMY_HASH)
  if (!emailOk || !passwordOk) return next(new HttpError(401, 'Email or password is incorrect'))

  const token = jwt.sign({ sub: env.ADMIN_EMAIL, role: 'admin' }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  })
  const { exp } = jwt.decode(token)
  res.json({ token, expiresAt: new Date(exp * 1000).toISOString(), email: env.ADMIN_EMAIL })
}

export function me(req, res) {
  res.json({ email: req.admin.email, role: 'admin' })
}
