import { ZodError } from 'zod'
import mongoose from 'mongoose'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Please fix the highlighted fields',
      fields: Object.fromEntries(err.issues.map((i) => [i.path.join('.') || 'body', i.message])),
    })
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid project id' })
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'Please fix the highlighted fields',
      fields: Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message])),
    })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' })
  }
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({
    error: status >= 500 ? 'Something went wrong on the server' : err.message,
    ...(err.fields ? { fields: err.fields } : {}),
  })
}
