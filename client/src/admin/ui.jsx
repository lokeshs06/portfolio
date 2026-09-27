import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

export const inputCls =
  'w-full rounded-lg border border-line bg-bg px-3 py-2 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

export function Field({ id, label, hint, error, children, count }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {count && <span className="font-mono text-[11px] tabular-nums text-muted">{count}</span>}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger" role="alert">
          <CircleAlert size={13} /> {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}

export function Switch({ id, checked, onChange, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-line'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        className={`h-5 w-5 rounded-full bg-surface shadow ${checked ? 'ml-[22px]' : 'ml-0.5'}`}
      />
    </button>
  )
}

export function Toasts({ toasts, dismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[80] flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-[var(--shadow)]"
          >
            {t.tone === 'error' ? (
              <CircleAlert size={17} className="shrink-0 text-danger" />
            ) : (
              <CheckCircle2 size={17} className="shrink-0 text-leaf" />
            )}
            <span>{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action.run()
                  dismiss(t.id)
                }}
                className="font-semibold text-accent hover:underline"
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted hover:text-ink">
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
