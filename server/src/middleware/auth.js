import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError } from './error.js'

export function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return next(new HttpError(401, 'Please log in as admin'))
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] })
    if (payload.role !== 'admin') throw new Error('not admin')
    req.admin = { email: payload.sub }
    next()
  } catch {
    next(new HttpError(401, 'Your session has expired. Please log in again.'))
  }
}
