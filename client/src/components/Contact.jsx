import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, FileText, Mail, Phone } from 'lucide-react'
import { profile } from '../data'
import { isDemo } from '../lib/api'
import Reveal from './Reveal'
import { GithubIcon, LinkedinIcon } from './icons'

function CopyRow({ icon: Icon, label, value, href }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      const sel = window.getSelection()
      const range = document.createRange()
      const el = document.getElementById(`copy-${label}`)
      if (el && sel) {
        range.selectNodeContents(el)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <a href={href} className="flex min-w-0 items-center gap-3">
        <Icon size={18} className="shrink-0 text-accent" />
        <span className="min-w-0">
          <span className="block text-xs text-muted">{label}</span>
          <span id={`copy-${label}`} className="block truncate font-mono text-sm">
            {value}
          </span>
        </span>
      </a>
      <button
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted transition hover:bg-bg hover:text-ink"
        aria-label={`Copy ${label}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={copied ? 'y' : 'n'} initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }} className="flex items-center gap-1.5">
            {copied ? <Check size={14} className="text-leaf" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="eyebrow mb-3">Contact</p>
          <h2 className="text-5xl font-extrabold sm:text-6xl">
            Hiring a full stack developer? <span className="text-accent">Let&apos;s talk.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg text-muted">
            I&apos;m graduating in 2027 and looking for internships and entry-level roles in full stack or backend
            development. Email is the fastest way to reach me.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="space-y-3">
          <CopyRow icon={Mail} label="Email" value={profile.email} href={`mailto:${profile.email}`} />
          <CopyRow icon={Phone} label="Phone" value={profile.phone} href={`tel:${profile.phone.replace(/\s/g, '')}`} />
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { href: profile.linkedin, label: 'LinkedIn', icon: LinkedinIcon },
              { href: profile.github, label: 'GitHub', icon: GithubIcon },
              { href: profile.resume, label: 'Resume', icon: FileText },
            ].map(({ href, label, icon: Icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -4 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface py-4 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                <Icon size={20} />
                {label}
              </motion.a>
            ))}
          </div>
        </Reveal>
      </div>
      <footer className="mt-24 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-mono text-xs text-muted">
        <span>© {new Date().getFullYear()} Lokesh M</span>
        <span className="flex items-center gap-4">
          <span>Built with React, Express and MongoDB</span>
          {isDemo && (
            <a href="#admin" className="rounded-full border border-line px-3 py-1 text-ink transition hover:border-accent hover:text-accent">
              Admin (demo)
            </a>
          )}
        </span>
      </footer>
    </section>
  )
}
