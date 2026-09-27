import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'
import { endpoints } from '../data'

// Colour one line of pretty-printed JSON
function highlight(line) {
  const parts = []
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g
  let last = 0
  let m
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ t: line.slice(last, m.index), c: 'var(--code-muted)' })
    if (m[1] && m[2]) {
      parts.push({ t: m[1], c: 'var(--code-key)' })
      parts.push({ t: m[2], c: 'var(--code-muted)' })
    } else if (m[1]) parts.push({ t: m[1], c: 'var(--code-str)' })
    else if (m[3]) parts.push({ t: m[3], c: 'var(--code-num)' })
    else parts.push({ t: m[4], c: 'var(--code-num)' })
    last = re.lastIndex
  }
  if (last < line.length) parts.push({ t: line.slice(last), c: 'var(--code-muted)' })
  return parts
}

const methodColor = { GET: 'var(--code-str)', POST: 'var(--code-key)' }

// /projects answers with whatever is currently featured on the site
function withLiveProjects(projects) {
  const featured = projects.filter((p) => p.featured)
  return endpoints.map((ep) =>
    ep.id === 'projects' && featured.length
      ? {
          ...ep,
          body: featured.map((p) => ({
            name: p.name,
            ...(p.period ? { period: p.period } : {}),
            stack: p.stack.slice(0, 3),
            ...(p.repoUrl ? { repo: p.repoUrl.replace(/^https?:\/\/(www\.)?/, '') } : {}),
          })),
        }
      : ep,
  )
}

export default function ApiConsole({ projects = [] }) {
  const eps = useMemo(() => withLiveProjects(projects), [projects])
  const [currentId, setCurrentId] = useState(eps[0].id)
  const current = eps.find((e) => e.id === currentId) ?? eps[0]
  const [phase, setPhase] = useState('done') // 'sending' | 'typing' | 'done'
  const [shown, setShown] = useState(Infinity)
  const timers = useRef([])

  const lines = useMemo(() => JSON.stringify(current.body, null, 2).split('\n'), [current])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function send(ep) {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setCurrentId(ep.id)
    setPhase('sending')
    setShown(0)
    const total = JSON.stringify(ep.body, null, 2).split('\n').length
    timers.current.push(
      setTimeout(() => {
        setPhase('typing')
        for (let i = 1; i <= total; i++) {
          timers.current.push(
            setTimeout(() => {
              setShown(i)
              if (i === total) setPhase('done')
            }, i * 45),
          )
        }
      }, 420),
    )
  }

  const created = current.status.startsWith('201')

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 font-mono text-[13px] shadow-[var(--shadow)]"
      style={{ background: 'var(--code-bg)', color: 'var(--code-ink)' }}
    >
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate text-xs" style={{ color: 'var(--code-muted)' }}>
          api.lokesh.dev
        </span>
      </div>

      {/* endpoint picker */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-3" role="tablist" aria-label="Try an endpoint">
        {eps.map((ep) => {
          const on = ep.id === current.id
          return (
            <button
              key={ep.id}
              role="tab"
              aria-selected={on}
              onClick={() => send(ep)}
              className={`group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition ${
                on ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <span style={{ color: methodColor[ep.method] }} className="font-medium">
                {ep.method}
              </span>
              <span className={on ? 'text-white' : 'text-white/60 group-hover:text-white/90'}>
                {ep.path.replace('/api', '').split('?')[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* request line */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <p className="truncate">
          <span style={{ color: methodColor[current.method] }}>{current.method}</span>{' '}
          <span className="text-white/90">{current.path}</span>
        </p>
        <button
          onClick={() => send(current)}
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Send request again"
        >
          <Play size={12} /> Send
        </button>
      </div>

      {/* status */}
      <div className="flex h-7 items-center gap-2 px-4 text-xs">
        <AnimatePresence mode="wait">
          {phase === 'sending' ? (
            <motion.span key="s" initial={{ y: 4 }} animate={{ y: 0 }} exit={{ y: -4 }} style={{ color: 'var(--code-muted)' }}>
              sending request…
            </motion.span>
          ) : (
            <motion.span key={current.id + 'ok'} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <span
                className="rounded px-1.5 py-0.5 font-medium"
                style={{ background: created ? 'rgb(240 178 74 / 0.15)' : 'rgb(127 211 161 / 0.15)', color: created ? 'var(--code-key)' : 'var(--code-str)' }}
              >
                {current.status}
              </span>
              <span style={{ color: 'var(--code-muted)' }}>{current.ms} ms · application/json</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* body */}
      <pre className="min-h-[17rem] overflow-x-auto px-4 pb-5 pt-2 leading-relaxed" aria-live="polite">
        {lines.slice(0, shown).map((line, i) => (
          <div key={current.id + i} className={i === Math.min(shown, lines.length) - 1 && phase !== 'done' ? 'caret' : ''}>
            {highlight(line).map((p, j) => (
              <span key={j} style={{ color: p.c }}>
                {p.t}
              </span>
            ))}
          </div>
        ))}
        {phase === 'done' && created && (
          <motion.a
            href="#contact"
            initial={{ y: 6 }}
            animate={{ y: 0 }}
            className="mt-3 inline-block rounded-md px-3 py-1.5 text-xs font-medium"
            style={{ background: 'var(--code-key)', color: '#1a1204' }}
          >
            Go to contact →
          </motion.a>
        )}
      </pre>
    </div>
  )
}
