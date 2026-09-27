import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ExternalLink, EyeOff, Loader2, LogOut, Pencil, Plus, RotateCcw, Search, Star, Trash2 } from 'lucide-react'
import { createProject, deleteProject, getAllProjects, isDemo, reorderProjects, resetDemo, updateProject } from '../lib/api'
import { GithubIcon } from '../components/icons'
import ProjectForm from './ProjectForm'
import { Switch, Toasts } from './ui'

let toastId = 0

function Row({ p, index, groupSize, onMove, onToggle, onEdit, onDelete, busy }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <motion.li
      layout
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
      className={`grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-xl border bg-surface p-4 sm:grid-cols-[auto_1fr_auto] ${
        p.visible ? 'border-line' : 'border-dashed border-line opacity-75'
      }`}
    >
      <div className="flex flex-col">
        <button
          onClick={() => onMove(p, -1)}
          disabled={index === 0 || busy}
          className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-bg hover:text-ink disabled:opacity-30"
          aria-label={`Move ${p.name} up`}
        >
          <ArrowUp size={15} />
        </button>
        <button
          onClick={() => onMove(p, 1)}
          disabled={index === groupSize - 1 || busy}
          className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-bg hover:text-ink disabled:opacity-30"
          aria-label={`Move ${p.name} down`}
        >
          <ArrowDown size={15} />
        </button>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => onEdit(p)} className="truncate text-left text-lg font-semibold hover:text-accent">
            {p.name}
          </button>
          <span className="rounded-md bg-bg px-2 py-0.5 font-mono text-[11px] text-muted">{p.category}</span>
          {!p.visible && (
            <span className="inline-flex items-center gap-1 rounded-md bg-bg px-2 py-0.5 text-[11px] text-muted">
              <EyeOff size={11} /> Hidden
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {p.repoUrl ? (
            <a href={p.repoUrl} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1.5 text-muted hover:text-accent">
              <GithubIcon size={12} />
              <span className="truncate font-mono">{p.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
            </a>
          ) : (
            <button onClick={() => onEdit(p)} className="text-danger hover:underline">
              No source link. Add one
            </button>
          )}
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-accent">
              <ExternalLink size={12} /> Live demo
            </a>
          )}
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-1 sm:col-span-1">
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">Delete?</span>
            <button onClick={() => setConfirming(false)} className="rounded-full border border-line px-3 py-1.5 text-sm">
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirming(false)
                onDelete(p)
              }}
              className="rounded-full bg-danger px-3 py-1.5 text-sm font-medium text-white"
            >
              Delete
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onToggle(p, 'featured')}
              className={`grid h-9 w-9 place-items-center rounded-lg transition hover:bg-bg ${p.featured ? 'text-accent' : 'text-muted hover:text-ink'}`}
              aria-label={p.featured ? `Unfeature ${p.name}` : `Feature ${p.name}`}
              title={p.featured ? 'Featured' : 'Make featured'}
            >
              <Star size={17} fill={p.featured ? 'currentColor' : 'none'} />
            </button>
            <label className="flex items-center gap-2 px-2 text-xs text-muted" title="Show on portfolio">
              <Switch id={`vis-${p.id}`} checked={p.visible} onChange={() => onToggle(p, 'visible')} label={`Show ${p.name} on portfolio`} />
            </label>
            <button onClick={() => onEdit(p)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink" aria-label={`Edit ${p.name}`}>
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-bg hover:text-danger"
              aria-label={`Delete ${p.name}`}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </motion.li>
  )
}

export default function Dashboard({ session, onLogout, onExpired, goToSite }) {
  const [projects, setProjects] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // null | {} (new) | project
  const [busy, setBusy] = useState(false)
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback(
    (message, opts = {}) => {
      const id = ++toastId
      setToasts((t) => [...t.slice(-2), { id, message, ...opts }])
      setTimeout(() => dismiss(id), opts.action ? 6000 : 3500)
    },
    [dismiss],
  )

  // Any 401 means the token expired or is invalid
  const guard = useCallback(
    async (fn) => {
      try {
        return await fn()
      } catch (err) {
        if (err.status === 401) onExpired()
        throw err
      }
    },
    [onExpired],
  )

  const load = useCallback(
    () =>
      guard(() => getAllProjects(session.token))
        .then((list) => {
          setProjects(list)
          setLoadError('')
        })
        .catch((err) => setLoadError(err.message)),
    [guard, session.token],
  )

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(() => [...new Set((projects || []).map((p) => p.category))], [projects])
  const q = query.trim().toLowerCase()
  const match = (p) => !q || [p.name, p.category, p.repoUrl, ...p.stack].join(' ').toLowerCase().includes(q)
  const featured = (projects || []).filter((p) => p.featured)
  const others = (projects || []).filter((p) => !p.featured)

  async function save(payload) {
    const isNew = !editing?.id
    const saved = await guard(() => (isNew ? createProject(session.token, payload) : updateProject(session.token, editing.id, payload)))
    setProjects((list) => (isNew ? [...list, saved] : list.map((p) => (p.id === saved.id ? saved : p))))
    setEditing(null)
    toast(isNew ? `Added “${saved.name}”` : `Saved “${saved.name}”`)
    if (isNew) load()
  }

  async function toggle(p, key) {
    const next = !p[key]
    setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, [key]: next } : x)))
    try {
      await guard(() => updateProject(session.token, p.id, { [key]: next }))
      if (key === 'visible') toast(next ? `“${p.name}” is visible on your portfolio` : `“${p.name}” is hidden from visitors`)
      if (key === 'featured') toast(next ? `“${p.name}” is now a featured case study` : `“${p.name}” moved to the project grid`)
    } catch (err) {
      setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, [key]: !next } : x)))
      toast(err.message, { tone: 'error' })
    }
  }

  async function move(p, dir) {
    const group = p.featured ? featured : others
    const i = group.findIndex((x) => x.id === p.id)
    const j = i + dir
    if (j < 0 || j >= group.length) return
    const reordered = [...group]
    ;[reordered[i], reordered[j]] = [reordered[j], reordered[i]]
    const ids = p.featured ? [...reordered, ...others].map((x) => x.id) : [...featured, ...reordered].map((x) => x.id)
    const previous = projects
    setProjects(ids.map((id, order) => ({ ...previous.find((x) => x.id === id), order })))
    setBusy(true)
    try {
      await guard(() => reorderProjects(session.token, ids))
    } catch (err) {
      setProjects(previous)
      toast(err.message, { tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function remove(p) {
    const previous = projects
    setProjects((list) => list.filter((x) => x.id !== p.id))
    try {
      await guard(() => deleteProject(session.token, p.id))
      // eslint-disable-next-line no-unused-vars
      const { id, ...data } = p
      toast(`Deleted “${p.name}”`, {
        action: {
          label: 'Undo',
          run: async () => {
            try {
              await guard(() => createProject(session.token, data))
              load()
              toast(`Restored “${p.name}”`)
            } catch (err) {
              toast(err.message, { tone: 'error' })
            }
          },
        },
      })
    } catch (err) {
      setProjects(previous)
      toast(err.message, { tone: 'error' })
    }
  }

  const group = (title, list, note) => {
    const visible = list.filter(match)
    return (
      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-bold">
            {title} <span className="font-mono text-sm font-normal text-muted">{list.length}</span>
          </h2>
          <p className="text-xs text-muted">{note}</p>
        </div>
        {visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            {q ? 'No projects match your search.' : 'Nothing here yet.'}
          </p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {visible.map((p) => (
                <Row
                  key={p.id}
                  p={p}
                  index={list.indexOf(p)}
                  groupSize={list.length}
                  busy={busy || Boolean(q)}
                  onMove={move}
                  onToggle={toggle}
                  onEdit={setEditing}
                  onDelete={remove}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-bg">
      <header className="sticky z-40 border-b border-line bg-bg/85 backdrop-blur-md" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm">
              <span className="text-accent">~/</span>admin
            </span>
            {isDemo && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium">Demo mode</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToSite} aria-label="View site" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm hover:border-accent">
              <ExternalLink size={14} /> <span className="hidden sm:inline">View site</span>
            </button>
            <button onClick={onLogout} aria-label="Log out" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink">
              <LogOut size={14} /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Signed in as {session.email}</p>
            <h1 className="mt-1 text-4xl font-extrabold">Projects</h1>
          </div>
          <button
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink transition hover:-translate-y-0.5"
          >
            <Plus size={17} /> Add project
          </button>
        </div>

        {isDemo && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent-soft px-4 py-3 text-sm">
            <p>
              No server connected. Changes are saved in this browser and show up on the portfolio page right away. Set{' '}
              <code className="font-mono text-xs">VITE_API_URL</code> to use your real database.
            </p>
            <button
              onClick={() => {
                resetDemo()
                load()
                toast('Demo data reset')
              }}
              className="inline-flex items-center gap-1.5 font-medium hover:underline"
            >
              <RotateCcw size={14} /> Reset demo data
            </button>
          </div>
        )}

        <div className="relative mt-8">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="admin-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, tech or link"
            className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-4 text-[15px] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        {q && <p className="mt-2 text-xs text-muted">Clear the search to reorder projects.</p>}

        {loadError ? (
          <div className="mt-10 rounded-xl border border-danger/30 bg-danger/10 p-5">
            <p className="font-medium">Couldn&apos;t load projects</p>
            <p className="mt-1 text-sm text-muted">{loadError}</p>
            <button onClick={load} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              <RotateCcw size={14} /> Try again
            </button>
          </div>
        ) : !projects ? (
          <p className="mt-16 flex items-center justify-center gap-2 text-muted">
            <Loader2 size={18} className="animate-spin" /> Loading projects…
          </p>
        ) : (
          <>
            {group('Featured case studies', featured, 'Shown large in “Selected work”')}
            {group('Project grid', others, 'Shown as cards in “More projects”')}
          </>
        )}
      </main>

      <AnimatePresence>
        {editing && (
          <ProjectForm
            key={editing.id || 'new'}
            project={editing.id ? editing : null}
            categories={categories}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
      <Toasts toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
