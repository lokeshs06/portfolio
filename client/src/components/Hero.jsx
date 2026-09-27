import { motion } from 'framer-motion'
import { ArrowUpRight, FileText, MapPin } from 'lucide-react'
import { profile } from '../data'
import ApiConsole from './ApiConsole'
import { GithubIcon, LinkedinIcon } from './icons'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay) => ({
  initial: { y: 24 },
  animate: { y: 0 },
  transition: { duration: 0.8, delay, ease },
})

export default function Hero({ projects }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div>
          <motion.p {...rise(0)} className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
              </span>
              {profile.openTo}
            </span>
          </motion.p>

          <motion.h1 {...rise(0.08)} className="text-6xl font-extrabold sm:text-7xl lg:text-8xl">
            Lokesh <span className="text-accent">M</span>
          </motion.h1>

          <motion.p {...rise(0.16)} className="mt-3 font-display text-2xl font-semibold text-muted sm:text-3xl">
            {profile.role}
          </motion.p>

          <motion.p {...rise(0.24)} className="mt-6 max-w-xl text-lg text-muted">
            {profile.tagline}
          </motion.p>

          <motion.div {...rise(0.3)} className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} /> {profile.location}
            </span>
            <span>{profile.education}</span>
          </motion.div>

          <motion.div {...rise(0.38)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-ink transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
            >
              See my work
              <ArrowUpRight size={18} className="transition group-hover:rotate-45" />
            </a>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 font-medium transition hover:-translate-y-0.5 hover:border-accent"
            >
              <FileText size={17} /> Resume
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              <GithubIcon />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              <LinkedinIcon />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 40, rotate: 1.5 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
        >
          <p className="eyebrow mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Try my API · click an endpoint
          </p>
          <ApiConsole projects={projects} />
        </motion.div>
      </div>
    </section>
  )
}
