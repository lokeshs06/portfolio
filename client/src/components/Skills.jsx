import { motion } from 'framer-motion'
import { skills } from '../data'
import SectionHeading from './SectionHeading'

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading label="Toolbox" title="What I build with">
        Everything here shows up in at least one project above.
      </SectionHeading>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g, gi) => (
          <div key={g.group}>
            <p className="mb-3 flex items-baseline justify-between border-b border-line pb-2">
              <span className="font-display text-lg font-semibold">{g.group}</span>
              <span className="font-mono text-xs text-muted">{String(g.items.length).padStart(2, '0')}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ y: 10 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: gi * 0.05 + i * 0.03 }}
                  whileHover={{ y: -3, rotate: -2 }}
                  className="cursor-default rounded-lg border border-line bg-surface px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
