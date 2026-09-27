import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Loader2 } from 'lucide-react'
import { DEMO_LOGIN, isDemo, login } from '../lib/api'
import { Field, inputCls } from './ui'

export default function Login({ onLogin, notice, goToSite }) {
  const [email, setEmail] = useState(isDemo ? DEMO_LOGIN.email : '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(notice || '')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) return setError('Enter your email and password.')
    setBusy(true)
    try {
      const session = await login(email.trim(), password)
      onLogin(session)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-bg px-4 py-10">
      <motion.div
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <button onClick={goToSite} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={15} /> Back to portfolio
        </button>
        <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-7 shadow-[var(--shadow)]" noValidate>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <Lock size={20} />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">Admin login</h1>
          <p className="mt-1.5 text-sm text-muted">Manage the projects shown on your portfolio.</p>

          {isDemo && (
            <p className="mt-5 rounded-lg bg-accent-soft px-3 py-2.5 text-xs leading-relaxed">
              <strong>Demo mode.</strong> No server is connected, so changes are saved in this browser only. Password:{' '}
              <code className="font-mono font-semibold">{DEMO_LOGIN.password}</code>
            </p>
          )}

          <div className="mt-6 space-y-4">
            <Field id="login-email" label="Email">
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field id="login-password" label="Password">
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoFocus
              />
            </Field>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-medium text-accent-ink transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
          >
            {busy && <Loader2 size={17} className="animate-spin" />}
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
