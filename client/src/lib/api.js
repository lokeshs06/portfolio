// Talks to the Express API when VITE_API_URL is set.
// Without it, runs in "demo mode": the same functions work against the browser's
// localStorage, so the site and /admin can be tried with no backend.
import { projects as fallbackProjects } from '../data'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
export const isDemo = !API_URL
export const DEMO_LOGIN = { email: 'lokesh.s0926@gmail.com', password: 'demo1234' }

export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

// ---------- shared helpers ----------
export function normalize(p, i = 0) {
  return {
    id: p.id ?? `local-${i}`,
    name: p.name ?? '',
    subtitle: p.subtitle ?? '',
    category: p.category ?? 'Other',
    description: p.description ?? '',
    period: p.period ?? '',
    stack: p.stack ?? [],
    repoUrl: p.repoUrl ?? '',
    liveUrl: p.liveUrl ?? '',
    featured: Boolean(p.featured),
    highlights: p.highlights ?? [],
    metrics: p.metrics ?? [],
    visual: p.visual ?? 'none',
    order: p.order ?? i,
    visible: p.visible ?? true,
  }
}

export const fallback = fallbackProjects.map(normalize)

const sortProjects = (list) =>
  [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)

function safeStorage(kind) {
  try {
    const s = window[kind]
    const k = '__t'
    s.setItem(k, k)
    s.removeItem(k)
    return s
  } catch {
    return null
  }
}
const local = safeStorage('localStorage')
const session = safeStorage('sessionStorage')

export function readJSON(store, key, fallbackValue) {
  try {
    const raw = store?.getItem(key)
    return raw ? JSON.parse(raw) : fallbackValue
  } catch {
    return fallbackValue
  }
}
export function writeJSON(store, key, value) {
  try {
    if (value === undefined) store?.removeItem(key)
    else store?.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked */
  }
}

export const storage = { local, session }

// ---------- real API ----------
async function request(path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. It may be waking up, try again in a few seconds.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.fields || {})
  return data
}

// ---------- demo store ----------
const DEMO_KEY = 'portfolio-demo-projects'
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))
let memoryStore = null

function demoRead() {
  const saved = readJSON(local, DEMO_KEY, null)
  if (saved) return saved
  if (!memoryStore) memoryStore = fallback.map((p) => ({ ...p }))
  return memoryStore
}
function demoWrite(list) {
  memoryStore = list
  writeJSON(local, DEMO_KEY, list)
  window.dispatchEvent(new Event('portfolio:projects-changed'))
}

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/i
function demoValidate(p, partial = false, id = null) {
  const fields = {}
  if (p.name && demoRead().some((x) => x.id !== id && x.name.toLowerCase() === p.name.trim().toLowerCase()))
    fields.name = 'You already have a project with this name'
  const has = (k) => !partial || k in p
  if (has('name') && !p.name?.trim()) fields.name = 'Name is required'
  if (has('category') && !p.category?.trim()) fields.category = 'Category is required'
  if (has('description') && (p.description?.trim().length ?? 0) < 10)
    fields.description = 'Description should be at least 10 characters'
  for (const k of ['repoUrl', 'liveUrl'])
    if (p[k] && !URL_RE.test(p[k])) fields[k] = 'Must be a full URL starting with https://'
  if (Object.keys(fields).length) throw new ApiError('Please fix the highlighted fields', 400, fields)
}

// ---------- public functions ----------
export async function getPublicProjects() {
  if (isDemo) return sortProjects(demoRead().filter((p) => p.visible))
  return (await request('/api/projects')).map(normalize)
}

export async function login(email, password) {
  if (isDemo) {
    await wait(400)
    if (email.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password)
      throw new ApiError('Email or password is incorrect', 401)
    return { token: 'demo-token', email: DEMO_LOGIN.email, expiresAt: new Date(Date.now() + 2 * 3600e3).toISOString() }
  }
  return request('/api/auth/login', { method: 'POST', body: { email, password } })
}

export async function getAllProjects(token) {
  if (isDemo) {
    await wait(150)
    return sortProjects(demoRead())
  }
  return (await request('/api/admin/projects', { token })).map(normalize)
}

export async function createProject(token, data) {
  if (isDemo) {
    await wait()
    demoValidate(data)
    const list = demoRead()
    const created = normalize({ ...data, id: `demo-${Date.now()}`, order: data.order || list.length })
    demoWrite([...list, created])
    return created
  }
  return normalize(await request('/api/admin/projects', { method: 'POST', body: data, token }))
}

export async function updateProject(token, id, patch) {
  if (isDemo) {
    await wait()
    demoValidate(patch, true, id)
    const list = demoRead()
    const next = list.map((p) => (p.id === id ? { ...p, ...patch } : p))
    demoWrite(next)
    return next.find((p) => p.id === id)
  }
  return normalize(await request(`/api/admin/projects/${id}`, { method: 'PATCH', body: patch, token }))
}

export async function deleteProject(token, id) {
  if (isDemo) {
    await wait()
    demoWrite(demoRead().filter((p) => p.id !== id))
    return { id, deleted: true }
  }
  return request(`/api/admin/projects/${id}`, { method: 'DELETE', token })
}

export async function reorderProjects(token, ids) {
  if (isDemo) {
    await wait(120)
    const byId = Object.fromEntries(demoRead().map((p) => [p.id, p]))
    const next = ids.map((id, i) => ({ ...byId[id], order: i }))
    demoWrite(next)
    return sortProjects(next)
  }
  return (await request('/api/admin/projects/order', { method: 'PUT', body: { ids }, token })).map(normalize)
}

export function resetDemo() {
  memoryStore = null
  writeJSON(local, DEMO_KEY, undefined)
  window.dispatchEvent(new Event('portfolio:projects-changed'))
}
