import { readJSON, storage, writeJSON } from '../lib/api'

// Kept in sessionStorage, so closing the tab logs you out
const KEY = 'portfolio-admin-session'

export function loadSession() {
  const s = readJSON(storage.session, KEY, null)
  if (!s?.token || !s?.expiresAt || new Date(s.expiresAt) <= new Date()) return null
  return s
}

export function saveSession(s) {
  writeJSON(storage.session, KEY, s)
}

export function clearSession() {
  writeJSON(storage.session, KEY, undefined)
}
