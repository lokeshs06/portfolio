import { useCallback, useEffect, useState } from 'react'
import Login from './Login'
import Dashboard from './Dashboard'
import { clearSession, loadSession, saveSession } from './session'

export default function AdminApp({ goToSite }) {
  const [session, setSession] = useState(loadSession)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    document.title = 'Admin · Lokesh M'
    return () => {
      document.title = 'Lokesh M · Full Stack Developer'
    }
  }, [])

  const expire = useCallback(() => {
    clearSession()
    setSession(null)
    setNotice('Your session expired. Please log in again.')
  }, [])

  // Log out automatically when the token's expiry time passes
  useEffect(() => {
    if (!session) return
    const ms = new Date(session.expiresAt) - Date.now()
    const t = setTimeout(expire, Math.max(ms, 0))
    return () => clearTimeout(t)
  }, [session, expire])

  function onLogin(s) {
    saveSession(s)
    setNotice('')
    setSession(s)
  }

  function logout() {
    clearSession()
    setSession(null)
    setNotice('')
  }

  if (!session) return <Login onLogin={onLogin} notice={notice} goToSite={goToSite} />
  return <Dashboard session={session} onLogout={logout} onExpired={expire} goToSite={goToSite} />
}
