import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Award } from 'lucide-react'
import { journey, certifications } from '../data'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

export default function Journey() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const height = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section id="journey" className="border-t border-line bg-bg-2">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading label="Journey" title="Education & experience" />
          <ol ref={ref} className="relative ml-2 border-l-2 border-line pl-8">
            <motion.span className="absolute -left-0.5 top-0 w-0.5 bg-accent" style={{ height }} aria-hidden="true" />
            {journey.map((j) => (
              <Reveal as="li" key={j.title} className="relative pb-10 last:pb-0">
                <span
                  className={`absolute -left-[2.6rem] top-1.5 h-4 w-4 rounded-full border-2 ${
                    j.upcoming ? 'border-dashed border-muted bg-bg-2' : 'border-accent bg-bg-2'
                  }`}
                />
                <p className="font-mono text-xs text-accent">{j.date}</p>
                <h3 className="mt-1 text-xl font-bold">{j.title}</h3>
                <p className="text-sm text-muted">{j.place}</p>
                <p className="mt-2 max-w-md text-[15px]">{j.detail}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="lg:pt-32">
          <Reveal className="rounded-2xl border border-line bg-surface p-6">
            <p className="eyebrow mb-5">Certifications</p>
            <ul className="space-y-5">
              {certifications.map((c) => (
                <li key={c.name} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                    <Award size={17} />
                  </span>
                  <div>
                    <p className="font-medium leading-snug">{c.name}</p>
                    <p className="text-sm text-muted">{c.issuer}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
