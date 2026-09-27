import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'

const links = [
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
]

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Nav() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  // Highlight the section currently on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    links.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className="sticky z-50 border-b border-line/70 bg-bg/80 backdrop-blur-md"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <motion.div className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent" style={{ scaleX: progress }} />
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="font-mono text-sm font-medium tracking-tight">
          <span className="text-accent">~/</span>lokesh<span className="text-muted">.dev</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.id} className="relative">
              <a
                href={`#${l.id}`}
                className={`relative z-10 block rounded-full px-4 py-1.5 text-sm transition-colors ${
                  active === l.id ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {l.label}
              </a>
              {active === l.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-surface shadow-[var(--shadow)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-accent hover:text-accent"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-line md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            {links.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block px-4 py-3 text-muted hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
