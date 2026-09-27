import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Bike, Check, ChefHat, CircleDashed, ClipboardCheck, ExternalLink, Layers, Leaf, PackageCheck, Pause, Play, Store } from 'lucide-react'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'
import { GithubIcon } from './icons'

/* ---------- Manthulir: animated architecture flow ---------- */
const MANTHULIR_FLOW = [
  { label: 'Farmer', sub: 'PWA or WhatsApp' },
  { label: 'Express API', sub: 'JWT · Zod · Swagger' },
  { label: 'FastAPI ML', sub: 'MobileNetV3' },
  { label: 'MongoDB Atlas', sub: '12 models' },
]

function ArchitectureFlow({ flow = MANTHULIR_FLOW }) {
  const [hover, setHover] = useState(null)
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <p className="eyebrow mb-5">How a pest photo becomes a diagnosis</p>
      <ol className="flex flex-col items-stretch sm:flex-row sm:items-center">
        {flow.map((step, i) => (
          <li key={step.label} className="flex flex-col items-stretch sm:flex-1 sm:flex-row sm:items-center">
            <motion.div
              onHoverStart={() => setHover(i)}
              onHoverEnd={() => setHover(null)}
              whileHover={{ y: -4 }}
              className={`rounded-xl border px-3 py-3 text-center transition-colors sm:w-full ${
                hover === i ? 'border-accent bg-accent-soft' : 'border-line bg-bg'
              }`}
            >
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted">{step.sub}</p>
            </motion.div>
            {i < flow.length - 1 && (
              <>
                <span className="flow-line-v mx-auto h-6 w-0.5 sm:hidden" aria-hidden="true" />
                <span className="flow-line hidden h-0.5 w-6 shrink-0 sm:block" aria-hidden="true" />
              </>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        {[
          ['Model', 'MobileNetV3-Large'],
          ['Classes', '8 tomato leaf diseases'],
          ['Macro-F1', '97.72%'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-bg px-3 py-2">
            <p className="eyebrow !text-[10px]">{k}</p>
            <p className="font-mono text-sm">{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- OFDS: live order tracker ---------- */
const statusIcons = [CircleDashed, ClipboardCheck, ChefHat, PackageCheck, Bike, Check]
const ORDER_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for delivery', 'Delivered']

function OrderTracker({ statuses = ORDER_STATUSES }) {
  const [step, setStep] = useState(2)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setStep((s) => (s + 1) % statuses.length), 1600)
    return () => clearInterval(id)
  }, [playing, statuses.length])

  const pct = (step / (statuses.length - 1)) * 100

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="eyebrow">Demo order · live status</p>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
        >
          {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-4 right-4 top-4 h-1 rounded-full bg-line" />
        <motion.div
          className="absolute left-4 top-4 h-1 rounded-full bg-accent"
          animate={{ width: `calc((100% - 2rem) * ${pct / 100})` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        <ol className="relative flex justify-between">
          {statuses.map((s, i) => {
            const Icon = statusIcons[i]
            const done = i <= step
            return (
              <li key={s} className="flex w-9 flex-col items-center">
                <button
                  onClick={() => {
                    setStep(i)
                    setPlaying(false)
                  }}
                  aria-label={s}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-colors ${
                    done ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-muted'
                  }`}
                >
                  <Icon size={15} />
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted">Current status</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2 }}
              className="font-display text-2xl font-bold"
            >
              {statuses[step]}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className="font-mono text-xs text-muted">
          step {step + 1}/{statuses.length}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        {['Stripe card', 'Cash on delivery', 'Wallet'].map((p) => (
          <div key={p} className="rounded-lg bg-bg px-2 py-2 text-muted">
            {p}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Any other featured project: stack + links card ---------- */
function StackPanel({ project }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <p className="eyebrow mb-5 flex items-center gap-2">
        <Layers size={14} className="text-accent" /> Built with
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {project.stack.map((t, i) => (
          <motion.div
            key={t}
            initial={{ y: 10 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-xs"
          >
            {t}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Visual({ project }) {
  if (project.visual === 'architecture') return <ArchitectureFlow />
  if (project.visual === 'order-tracker') return <OrderTracker />
  return <StackPanel project={project} />
}

function CaseStudy({ project, flip }) {
  const Icon = project.visual === 'order-tracker' ? Store : Leaf
  return (
    <article className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <Reveal className={flip ? 'lg:order-2' : ''}>
        <p className="eyebrow mb-4 flex items-center gap-2">
          <Icon size={14} className="text-accent" /> Featured project{project.period ? ` · ${project.period}` : ''}
        </p>
        <h3 className="text-4xl font-extrabold sm:text-5xl">{project.name}</h3>
        {project.subtitle && <p className="mt-2 font-mono text-sm text-muted">{project.subtitle}</p>}
        <p className="mt-5 text-lg text-muted">{project.description}</p>

        {project.metrics.length > 0 && (
          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {project.metrics.map((m) => (
              <div key={m.label} className="border-l-2 border-accent pl-3">
                <dt className="order-2 text-xs text-muted">{m.label}</dt>
                <dd className="font-display text-2xl font-bold tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {project.highlights.length > 0 && (
          <ul className="mt-7 space-y-3">
            {project.highlights.map((p) => (
              <li key={p} className="flex gap-3 text-[15px]">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-7 flex flex-wrap gap-2">
          {project.stack.map((t) => (
            <span key={t} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 font-medium text-ink underline decoration-accent decoration-2 underline-offset-4"
            >
              <GithubIcon size={16} /> View source on GitHub
              <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition hover:-translate-y-0.5"
            >
              <ExternalLink size={15} /> Live demo
            </a>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1} className={`lg:sticky lg:top-24 ${flip ? 'lg:order-1' : ''}`}>
        <Visual project={project} />
      </Reveal>
    </article>
  )
}

export default function Featured({ projects }) {
  const featured = projects.filter((p) => p.featured)
  if (featured.length === 0) return null
  return (
    <section id="work" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading label="Selected work" title="Products, built end to end">
        Full stack projects I designed, built, tested and deployed myself.
      </SectionHeading>
      <div className="space-y-28">
        {featured.map((p, i) => (
          <CaseStudy key={p.name} project={p} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
