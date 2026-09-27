import { z } from 'zod'
import { VISUALS } from '../models/Project.js'

// Empty string is allowed so a link can be cleared; otherwise it must be http(s)
const link = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v), 'Must be a full URL starting with https://')

const shortList = (max, itemMax) => z.array(z.string().trim().min(1).max(itemMax)).max(max)

// Field rules shared by create and update
const fields = {
  name: z.string().trim().min(1, 'Name is required').max(80),
  subtitle: z.string().trim().max(120),
  category: z.string().trim().min(1, 'Category is required').max(30),
  description: z.string().trim().min(10, 'Description should be at least 10 characters').max(600),
  period: z.string().trim().max(40),
  stack: shortList(20, 40),
  repoUrl: link,
  liveUrl: link,
  featured: z.boolean(),
  highlights: shortList(8, 300),
  metrics: z
    .array(z.object({ value: z.string().trim().min(1).max(20), label: z.string().trim().min(1).max(40) }))
    .max(6),
  visual: z.enum(VISUALS),
  order: z.number().int().min(0).max(10000),
  visible: z.boolean(),
}

// POST: required fields must be present, the rest get defaults
export const projectInput = z
  .object({
    ...fields,
    subtitle: fields.subtitle.default(''),
    period: fields.period.default(''),
    stack: fields.stack.default([]),
    repoUrl: fields.repoUrl.default(''),
    liveUrl: fields.liveUrl.default(''),
    featured: fields.featured.default(false),
    highlights: fields.highlights.default([]),
    metrics: fields.metrics.default([]),
    visual: fields.visual.default('none'),
    order: fields.order.default(0),
    visible: fields.visible.default(true),
  })
  .strict()

// PATCH: every field optional and nothing filled in, so only sent fields change
export const projectPatch = z
  .object(fields)
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Send at least one field to update')

export const reorderInput = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid project id')).min(1).max(200),
})

export const loginInput = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').max(200),
})
