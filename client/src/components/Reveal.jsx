import { motion } from 'framer-motion'

// Slides content up as it scrolls into view. Content is always visible
// (no opacity: 0 resting state), so nothing is hidden if JS is slow.
export default function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ y: 28 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}
