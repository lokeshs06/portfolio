import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Loader2, Plus, Trash2, X } from 'lucide-react'
import { Field, Switch, inputCls } from './ui'

const EMPTY = {
  name: '',
  subtitle: '',
  category: '',
  description: '',
  period: '',
  stack: [],
  repoUrl: '',
  liveUrl: '',
  featured: false,
  highlights: [],
  metrics: [],
  visual: 'none',
  visible: true,
}

const VISUAL_OPTIONS = [
  { value: 'none', label: 'Tech stack card' },
  { value: 'architecture', label: 'Architecture flow (Manthulir)' },
  { value: 'order-tracker', label: 'Order tracker (OFDS)' },
]

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/i

function toForm(project) {
  const p = { ...EMPTY, ...(project || {}) }
  return { ...p, highlightsText: p.highlights.join('\n') }
}

// Turn form state into the API payload
function toPayload(f) {
  return {
    name: f.name.trim(),
    subtitle: f.subtitle.trim(),
    category: f.category.trim(),
    description: f.description.trim(),
    period: f.period.trim(),
    stack: f.stack,
    repoUrl: f.repoUrl.trim(),
    liveUrl: f.liveUrl.trim(),
    featured: f.featured,
    highlights: f.highlightsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean),
    metrics: f.metrics.filter((m) => m.value.trim() && m.label.trim()).map((m) => ({ value: m.value.trim(), label: m.label.trim() })),
    visual: f.visual,
    visible: f.visible,
  }
}

function validate(p) {
  const e = {}
  if (!p.name) e.name = 'Give the project a name'
  if (!p.category) e.category = 'Pick or type a category'
  if (p.description.length < 10) e.description = 'Write at least a sentence (10+ characters)'
  if (p.repoUrl && !URL_RE.test(p.repoUrl)) e.repoUrl = 'Paste the full link, starting with https://'
  if (p.liveUrl && !URL_RE.test(p.liveUrl)) e.liveUrl = 'Paste the full link, starting with https://'
  if (p.highlights.length > 8) e.highlights = 'Keep it to 8 highlights or fewer'
  return e
}

function StackInput({ value, onChange }) {
  const [draft, setDraft] = useState('')
  function add(raw) {
    const items = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
    if (items.length) onChange([...value, ...items].slice(0, 20))
    setDraft('')
  }
  return (
    <div className={`${inputCls} flex flex-wrap items-center gap-1.5 !py-1.5`}>
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 font-mono text-xs">
          {t}
          <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} aria-label={`Remove ${t}`} className="text-muted hover:text-ink">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id="pf-stack"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add(draft)
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => draft && add(draft)}
        placeholder={value.length ? 'Add more…' : 'React, Node.js, MongoDB…'}
        className="min-w-[8rem] flex-1 bg-transparent py-1 outline-none"
      />
    </div>
  )
}

export default function ProjectForm({ project, categories, onSave, onClose }) {
  const isNew = !project?.id
  const initial = useMemo(() => toForm(project), [project])
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const firstField = useRef(null)

  const dirty = JSON.stringify(toPayload(form)) !== JSON.stringify(toPayload(initial))
  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val?.target ? val.target.value : val }))
    const errKey = key === 'highlightsText' ? 'highlights' : key
    if (errors[errKey]) setErrors(({ [errKey]: _removed, ...rest }) => rest)
  }

  function requestClose() {
    if (dirty && !confirmDiscard) return setConfirmDiscard(true)
    onClose()
  }

  // Esc closes the panel (asking first if there are unsaved changes)
  const closeRef = useRef(requestClose)
  useEffect(() => {
    closeRef.current = requestClose
  })
  useEffect(() => {
    firstField.current?.focus()
    const onKey = (e) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function submit(e) {
    e.preventDefault()
    const payload = toPayload(form)
    const found = validate(payload)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) return setFormError('Please fix the highlighted fields.')
    setSaving(true)
    try {
      await onSave(payload)
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
      setSaving(false)
    }
  }

  const metricRow = (m, i) => (
    <div key={i} className="flex items-center gap-2">
      <input
        aria-label={`Metric ${i + 1} value`}
        value={m.value}
        maxLength={20}
        onChange={(e) => set('metrics')(form.metrics.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
        placeholder="98%"
        className={`${inputCls} w-24 font-mono`}
      />
      <input
        aria-label={`Metric ${i + 1} label`}
        value={m.label}
        maxLength={40}
        onChange={(e) => set('metrics')(form.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
        placeholder="test accuracy"
        className={inputCls}
      />
      <button
        type="button"
        onClick={() => set('metrics')(form.metrics.filter((_, j) => j !== i))}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink"
        aria-label={`Remove metric ${i + 1}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="pf-title">
      <motion.div
        className="absolute inset-0 bg-[#0a111d]/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={requestClose}
      />
      <motion.form
        onSubmit={submit}
        noValidate
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-surface shadow-[var(--shadow)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <p className="eyebrow">{isNew ? 'New project' : 'Edit project'}</p>
            <h2 id="pf-title" className="mt-0.5 truncate text-2xl font-bold">
              {form.name.trim() || 'Untitled project'}
            </h2>
          </div>
          <button type="button" onClick={requestClose} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink" aria-label="Close">
            <X size={17} />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <section className="space-y-4">
            <h3 className="eyebrow">Basics</h3>
            <Field id="pf-name" label="Project name" error={errors.name}>
              <input id="pf-name" ref={firstField} value={form.name} onChange={set('name')} maxLength={80} className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="pf-category" label="Category" error={errors.category} hint="Used for the filter buttons">
                <input id="pf-category" list="pf-categories" value={form.category} onChange={set('category')} maxLength={30} className={inputCls} />
                <datalist id="pf-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field id="pf-period" label="Period" hint="e.g. Sep 2026" error={errors.period}>
                <input id="pf-period" value={form.period} onChange={set('period')} maxLength={40} className={inputCls} />
              </Field>
            </div>
            <Field id="pf-subtitle" label="Subtitle" hint="One short line under the name (featured projects)" error={errors.subtitle}>
              <input id="pf-subtitle" value={form.subtitle} onChange={set('subtitle')} maxLength={120} className={inputCls} />
            </Field>
            <Field id="pf-description" label="Description" error={errors.description} count={`${form.description.length}/600`}>
              <textarea id="pf-description" rows={4} value={form.description} onChange={set('description')} maxLength={600} className={`${inputCls} resize-y`} />
            </Field>
          </section>

          <section className="space-y-4">
            <h3 className="eyebrow">Links</h3>
            {[
              ['repoUrl', 'Source code (GitHub)', 'https://github.com/lokeshs06/…'],
              ['liveUrl', 'Live demo', 'https://your-app.netlify.app'],
            ].map(([key, label, ph]) => (
              <Field key={key} id={`pf-${key}`} label={label} error={errors[key]}>
                <div className="flex gap-2">
                  <input id={`pf-${key}`} type="url" inputMode="url" value={form[key]} onChange={set(key)} placeholder={ph} className={`${inputCls} font-mono text-sm`} />
                  {URL_RE.test(form[key].trim()) && (
                    <a
                      href={form[key].trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="grid w-10 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-accent hover:text-accent"
                      aria-label={`Open ${label}`}
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </Field>
            ))}
          </section>

          <section className="space-y-4">
            <h3 className="eyebrow">Tech stack</h3>
            <Field id="pf-stack" label="Technologies" hint="Press Enter or comma after each one" count={`${form.stack.length}/20`}>
              <StackInput value={form.stack} onChange={set('stack')} />
            </Field>
          </section>

          <section className="space-y-4">
            <h3 className="eyebrow">Display</h3>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
              <div>
                <p className="text-sm font-medium">Show on portfolio</p>
                <p className="text-xs text-muted">Hidden projects stay here but visitors can&apos;t see them</p>
              </div>
              <Switch id="pf-visible" checked={form.visible} onChange={set('visible')} label="Show on portfolio" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
              <div>
                <p className="text-sm font-medium">Featured case study</p>
                <p className="text-xs text-muted">Shown large in “Selected work” with highlights and metrics</p>
              </div>
              <Switch id="pf-featured" checked={form.featured} onChange={set('featured')} label="Featured case study" />
            </div>

            {form.featured && (
              <motion.div initial={{ y: -6 }} animate={{ y: 0 }} className="space-y-4 rounded-xl bg-bg p-4">
                <Field id="pf-visual" label="Side panel">
                  <select id="pf-visual" value={form.visual} onChange={set('visual')} className={inputCls}>
                    {VISUAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  id="pf-highlights"
                  label="Highlights"
                  hint="One bullet per line"
                  error={errors.highlights}
                  count={`${form.highlightsText.split('\n').filter((l) => l.trim()).length}/8`}
                >
                  <textarea id="pf-highlights" rows={5} value={form.highlightsText} onChange={set('highlightsText')} className={`${inputCls} resize-y`} />
                </Field>
                <div>
                  <p className="mb-1.5 text-sm font-medium">Metrics</p>
                  <div className="space-y-2">{form.metrics.map(metricRow)}</div>
                  {form.metrics.length < 6 && (
                    <button
                      type="button"
                      onClick={() => set('metrics')([...form.metrics, { value: '', label: '' }])}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <Plus size={15} /> Add metric
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </section>
        </div>

        <footer className="border-t border-line px-6 py-4">
          {confirmDiscard ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">Discard your unsaved changes?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-full border border-line px-4 py-2 text-sm">
                  Keep editing
                </button>
                <button type="button" onClick={onClose} className="rounded-full bg-danger px-4 py-2 text-sm font-medium text-white">
                  Discard
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-h-5 text-sm text-danger" role="alert">
                {formError}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={requestClose} className="rounded-full border border-line px-5 py-2.5 text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (!isNew && !dirty)}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {isNew ? 'Add project' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </footer>
      </motion.form>
    </div>
  )
}
