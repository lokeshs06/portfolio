import { useEffect, useState } from 'react'
import {
  DEMO_KEY,
  demoRead,
  fallback,
  getPublicProjects,
  isDemo,
  PROJECTS_CACHE_KEY,
  readJSON,
  storage,
  SYNC_KEY,
  writeJSON,
} from './api'

// Shows cached (or built-in) projects instantly, then swaps in fresh data from the API.
// If the API is down, the site keeps showing what it has.
export function useProjects() {
  const [projects, setProjects] = useState(() => {
    if (isDemo) {
      const demoList = demoRead()
      return demoList ? demoList.filter((p) => p.visible) : fallback.filter((p) => p.visible)
    }
    return readJSON(storage.local, PROJECTS_CACHE_KEY, fallback)
  })

  useEffect(() => {
    let alive = true
    const load = () =>
      getPublicProjects()
        .then((list) => {
          if (!alive) return
          setProjects(list)
          if (!isDemo) writeJSON(storage.local, PROJECTS_CACHE_KEY, list)
        })
        .catch(() => {
          /* keep showing cached / fallback data */
        })

    load()

    // Listen for changes in the same window/tab
    window.addEventListener('portfolio:projects-changed', load)

    // Listen for changes from other tabs/windows
    const onStorage = (e) => {
      if (e.key === SYNC_KEY || e.key === DEMO_KEY) {
        load()
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      alive = false
      window.removeEventListener('portfolio:projects-changed', load)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return projects
}
