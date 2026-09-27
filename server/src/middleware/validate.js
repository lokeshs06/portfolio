// Validate req.body against a zod schema and replace it with the parsed value
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {})
  if (!result.success) return next(result.error)
  req.body = result.data
  next()
}
