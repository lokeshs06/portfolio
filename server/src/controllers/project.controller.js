import mongoose from 'mongoose'
import { Project } from '../models/Project.js'
import { HttpError } from '../middleware/error.js'

const SORT = { featured: -1, order: 1, createdAt: 1 }

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid project id')
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Project names must be unique (case-insensitive); the site uses them as keys
async function assertUniqueName(name, excludeId) {
  if (!name) return
  const clash = await Project.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') }).select('_id')
  if (clash && clash._id.toString() !== excludeId) {
    const err = new HttpError(409, 'A project with this name already exists')
    err.fields = { name: 'You already have a project with this name' }
    throw err
  }
}

// Public: only visible projects
export async function listPublic(_req, res) {
  const projects = await Project.find({ visible: true }).sort(SORT)
  res.set('Cache-Control', 'public, max-age=60')
  res.json(projects)
}

// Admin: everything, including hidden projects
export async function listAll(_req, res) {
  res.json(await Project.find().sort(SORT))
}

export async function getOne(req, res) {
  assertId(req.params.id)
  const project = await Project.findById(req.params.id)
  if (!project) throw new HttpError(404, 'Project not found')
  res.json(project)
}

export async function create(req, res) {
  await assertUniqueName(req.body.name)
  const body = { ...req.body }
  if (!('order' in req.body) || body.order === 0) {
    const last = await Project.findOne().sort({ order: -1 }).select('order')
    body.order = last ? last.order + 1 : 0
  }
  const project = await Project.create(body)
  res.status(201).json(project)
}

export async function update(req, res) {
  assertId(req.params.id)
  await assertUniqueName(req.body.name, req.params.id)
  const project = await Project.findByIdAndUpdate(req.params.id, { $set: req.body }, { returnDocument: 'after', runValidators: true })
  if (!project) throw new HttpError(404, 'Project not found')
  res.json(project)
}

export async function remove(req, res) {
  assertId(req.params.id)
  const project = await Project.findByIdAndDelete(req.params.id)
  if (!project) throw new HttpError(404, 'Project not found')
  res.json({ id: req.params.id, deleted: true })
}

// Set `order` from the position of each id in the list
export async function reorder(req, res) {
  const { ids } = req.body
  await Project.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } })))
  res.json(await Project.find().sort(SORT))
}
