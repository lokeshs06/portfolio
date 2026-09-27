import { Router } from 'express'
import * as projects from '../controllers/project.controller.js'
import { requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { projectInput, projectPatch, reorderInput } from '../validators/project.schema.js'

// Express 4 does not catch rejected promises, so wrap async handlers
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export const publicProjects = Router()
publicProjects.get('/', wrap(projects.listPublic))

export const adminProjects = Router()
adminProjects.use(requireAdmin)
adminProjects.get('/', wrap(projects.listAll))
adminProjects.put('/order', validate(reorderInput), wrap(projects.reorder))
adminProjects.get('/:id', wrap(projects.getOne))
adminProjects.post('/', validate(projectInput), wrap(projects.create))
adminProjects.patch('/:id', validate(projectPatch), wrap(projects.update))
adminProjects.delete('/:id', wrap(projects.remove))
