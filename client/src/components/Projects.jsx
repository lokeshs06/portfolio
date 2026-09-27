import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { GithubIcon } from './icons'
import SectionHeading from './SectionHeading'

function ProjectCard({ p }) {
  function track(e) {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  const main = p.liveUrl || p.repoUrl
  return (
    <motion.article
      layout
      initial={{ scale: 0.92 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      whileHover={{ y: -6 }}
      onMouseMove={track}
      className="spotlight group relative flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">{p.category}</span>
        {main && <ArrowUpRight size={18} className="text-muted transition group-hover:rotate-45 group-hover:text-accent" />}
      </div>
      <h3 className="mt-3 text-2xl font-bold">
        {main ? (
          // stretched link: the whole card opens the live site (falls back to the repo)
          <a href={main} target="_blank" rel="noreferrer" className="after:absolute after:inset-0 after:rounded-2xl">
            {p.name}
          </a>
        ) : (
          p.name
        )}
      </h3>
      <p className="mt-3 flex-1 text-[15px] text-muted">{p.description}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {p.stack.map((t) => (
          <span key={t} className="rounded-md bg-bg px-2 py-0.5 font-mono text-[11px] text-muted">
            {t}
          </span>
        ))}
      </div>
      {(p.repoUrl || p.liveUrl) && (
        <div className="relative z-10 mt-5 flex gap-4 border-t border-line pt-4 text-sm">
          {p.repoUrl && (
            <a href={p.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-accent">
              <GithubIcon size={14} /> Code
            </a>
          )}
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-accent">
              <ExternalLink size={14} /> Live demo
            </a>
          )}
        </div>
      )}
    </motion.article>
  )
}

export default function Projects({ projects: all }) {
  const projects = all.filter((p) => !p.featured)
  const projectFilters = ['All', ...new Set(projects.map((p) => p.category))]
  const [filter, setFilter] = useState('All')
  const active = projectFilters.includes(filter) ? filter : 'All'
  const list = active === 'All' ? projects : projects.filter((p) => p.category === active)
  if (projects.length === 0) return null

  return (
    <section id="projects" className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading label="More projects" title="Smaller builds, each teaching one thing">
          React apps on public APIs, Node.js REST APIs in MVC, and a game in plain JavaScript. Every card links to its repo.
        </SectionHeading>

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
          {projectFilters.map((f) => {
            const count = f === 'All' ? projects.length : projects.filter((p) => p.category === f).length
            const on = f === active
            return (
              <button
                key={f}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f)}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${on ? 'text-accent-ink' : 'text-muted hover:text-ink'}`}
              >
                {on && (
                  <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">
                  {f} <span className="font-mono text-xs opacity-70">{count}</span>
                </span>
              </button>
            )
          })}
        </div>

        <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
