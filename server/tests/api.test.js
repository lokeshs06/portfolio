import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../src/app.js'
import { Project } from '../src/models/Project.js'

jest.setTimeout(60000)

let memoryServer
const sample = {
  name: 'Kanban Board',
  category: 'React',
  description: 'Drag-and-drop task board with three columns.',
  stack: ['React', 'dnd-kit'],
  repoUrl: 'https://github.com/lokeshs06/kanban-board',
}

beforeAll(async () => {
  let uri = process.env.MONGODB_URI_TEST
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    memoryServer = await MongoMemoryServer.create()
    uri = memoryServer.getUri()
  }
  await mongoose.connect(uri, { dbName: `portfolio_test_${Date.now()}` })
})

afterEach(async () => {
  await Project.deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
  if (memoryServer) await memoryServer.stop()
})

async function adminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'correct-horse-battery' })
  return res.body.token
}

describe('health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('auth', () => {
  it('rejects a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'nope' })
    expect(res.status).toBe(401)
    expect(res.body.token).toBeUndefined()
  })

  it('rejects a wrong email with the same message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'someone@example.com', password: 'correct-horse-battery' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Email or password is incorrect')
  })

  it('logs in and returns a token that works on /me', async () => {
    const token = await adminToken()
    expect(token).toEqual(expect.any(String))
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(me.status).toBe(200)
    expect(me.body.email).toBe('admin@example.com')
  })

  it('rejects a tampered token', async () => {
    const token = (await adminToken()) + 'x'
    const res = await request(app).get('/api/admin/projects').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })
})

describe('admin project CRUD', () => {
  it('blocks every admin route without a token', async () => {
    const id = new mongoose.Types.ObjectId().toString()
    const calls = [
      request(app).get('/api/admin/projects'),
      request(app).post('/api/admin/projects').send(sample),
      request(app).patch(`/api/admin/projects/${id}`).send({ name: 'x' }),
      request(app).delete(`/api/admin/projects/${id}`),
      request(app).put('/api/admin/projects/order').send({ ids: [id] }),
    ]
    for (const res of await Promise.all(calls)) expect(res.status).toBe(401)
    expect(await Project.countDocuments()).toBe(0)
  })

  it('creates, reads, updates and deletes a project', async () => {
    const token = await adminToken()
    const auth = { Authorization: `Bearer ${token}` }

    const created = await request(app).post('/api/admin/projects').set(auth).send(sample)
    expect(created.status).toBe(201)
    expect(created.body).toMatchObject({ name: 'Kanban Board', visible: true, featured: false, visual: 'none' })
    const { id } = created.body

    const pub = await request(app).get('/api/projects')
    expect(pub.body.map((p) => p.id)).toContain(id)

    const updated = await request(app)
      .patch(`/api/admin/projects/${id}`)
      .set(auth)
      .send({ liveUrl: 'https://kanban.netlify.app' })
    expect(updated.status).toBe(200)
    expect(updated.body.liveUrl).toBe('https://kanban.netlify.app')
    // a partial update must not reset other fields
    expect(updated.body.repoUrl).toBe(sample.repoUrl)
    expect(updated.body.stack).toEqual(sample.stack)

    const removed = await request(app).delete(`/api/admin/projects/${id}`).set(auth)
    expect(removed.status).toBe(200)
    expect(await Project.countDocuments()).toBe(0)

    const again = await request(app).delete(`/api/admin/projects/${id}`).set(auth)
    expect(again.status).toBe(404)
  })

  it('hides hidden projects from the public list only', async () => {
    const auth = { Authorization: `Bearer ${await adminToken()}` }
    const { body } = await request(app).post('/api/admin/projects').set(auth).send({ ...sample, visible: false })
    const pub = await request(app).get('/api/projects')
    expect(pub.body.find((p) => p.id === body.id)).toBeUndefined()
    const all = await request(app).get('/api/admin/projects').set(auth)
    expect(all.body.find((p) => p.id === body.id)).toBeDefined()
  })

  it('validates input', async () => {
    const auth = { Authorization: `Bearer ${await adminToken()}` }
    const bad = await request(app)
      .post('/api/admin/projects')
      .set(auth)
      .send({ ...sample, repoUrl: 'javascript:alert(1)', name: '' })
    expect(bad.status).toBe(400)
    expect(Object.keys(bad.body.fields)).toEqual(expect.arrayContaining(['repoUrl', 'name']))

    const unknownField = await request(app).post('/api/admin/projects').set(auth).send({ ...sample, isAdmin: true })
    expect(unknownField.status).toBe(400)

    const badId = await request(app).patch('/api/admin/projects/not-an-id').set(auth).send({ name: 'x' })
    expect(badId.status).toBe(400)
  })

  it('rejects duplicate project names', async () => {
    const auth = { Authorization: `Bearer ${await adminToken()}` }
    const first = await request(app).post('/api/admin/projects').set(auth).send(sample)
    const dup = await request(app).post('/api/admin/projects').set(auth).send({ ...sample, name: 'kanban board' })
    expect(dup.status).toBe(409)
    expect(dup.body.fields.name).toBeDefined()
    // renaming a project to its own name is fine
    const same = await request(app).patch(`/api/admin/projects/${first.body.id}`).set(auth).send({ name: 'Kanban Board' })
    expect(same.status).toBe(200)
  })

  it('reorders projects', async () => {
    const auth = { Authorization: `Bearer ${await adminToken()}` }
    const a = (await request(app).post('/api/admin/projects').set(auth).send({ ...sample, name: 'A' })).body
    const b = (await request(app).post('/api/admin/projects').set(auth).send({ ...sample, name: 'B' })).body
    const res = await request(app).put('/api/admin/projects/order').set(auth).send({ ids: [b.id, a.id] })
    expect(res.status).toBe(200)
    expect(res.body.map((p) => p.name)).toEqual(['B', 'A'])
  })

  it('lists featured projects first on the public endpoint', async () => {
    const auth = { Authorization: `Bearer ${await adminToken()}` }
    await request(app).post('/api/admin/projects').set(auth).send({ ...sample, name: 'Small' })
    await request(app).post('/api/admin/projects').set(auth).send({ ...sample, name: 'Big', featured: true })
    const pub = await request(app).get('/api/projects')
    expect(pub.body[0].name).toBe('Big')
  })
})
