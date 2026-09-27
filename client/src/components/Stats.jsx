import { motion } from 'framer-motion'
import { stats } from '../data'

export default function Stats({ projectCount }) {
  return (
    <section className="border-y border-line bg-bg-2">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="py-8 pr-4"
          >
            <p className="font-display text-4xl font-extrabold tabular-nums sm:text-5xl">{s.key === 'projectCount' ? projectCount : s.value}</p>
            <p className="mt-2 max-w-[16rem] text-sm text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
