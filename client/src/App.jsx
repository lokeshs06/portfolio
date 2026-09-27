import { lazy, Suspense, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Featured from './components/Featured'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Journey from './components/Journey'
import Contact from './components/Contact'
import { useProjects } from './lib/useProjects'

const AdminApp = lazy(() => import('./admin/AdminApp'))

// /admin (or #admin) opens the dashboard; everything else is the portfolio
const isAdminRoute = () => /\/admin\/?$/.test(window.location.pathname) || window.location.hash === '#admin'

function Portfolio() {
  const projects = useProjects()
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero projects={projects} />
        <Stats projectCount={projects.length} />
        <Featured projects={projects} />
        <Projects projects={projects} />
        <Skills />
        <Journey />
        <Contact />
      </main>
    </>
  )
}

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute)

  useEffect(() => {
    const sync = () => setAdmin(isAdminRoute())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  useEffect(() => {
    if (!admin) return
    window.scrollTo(0, 0)
  }, [admin])

  function goToSite() {
    if (window.location.hash === '#admin') {
      window.location.hash = ''
    } else {
      window.history.pushState({}, '', window.location.pathname.replace(/\/admin\/?$/, '/') || '/')
    }
    setAdmin(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      {admin ? (
        <Suspense fallback={<div className="min-h-[100dvh] bg-bg" />}>
          <AdminApp goToSite={goToSite} />
        </Suspense>
      ) : (
        <Portfolio />
      )}
    </MotionConfig>
  )
}
