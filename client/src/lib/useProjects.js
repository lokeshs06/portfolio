import { useEffect, useState } from 'react'
import { fallback, getPublicProjects, isDemo, readJSON, storage, writeJSON } from './api'

const CACHE_KEY = 'portfolio-projects-cache'

// Shows cached (or built-in) projects instantly, then swaps in fresh data from the API.
// If the API is down, the site keeps showing what it has.
export function useProjects() {
  const [projects, setProjects] = useState(() =>
    isDemo ? fallback.filter((p) => p.visible) : readJSON(storage.local, CACHE_KEY, fallback),
  )

  useEffect(() => {
    let alive = true
    const load = () =>
      getPublicProjects()
        .then((list) => {
          if (!alive) return
          setProjects(list)
          if (!isDemo) writeJSON(storage.local, CACHE_KEY, list)
        })
        .catch(() => {
          /* keep showing cached / fallback data */
        })
    load()
    window.addEventListener('portfolio:projects-changed', load)
    return () => {
      alive = false
      window.removeEventListener('portfolio:projects-changed', load)
    }
  }, [])

  return projects
}
