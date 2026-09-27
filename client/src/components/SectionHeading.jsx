import Reveal from './Reveal'

export default function SectionHeading({ label, title, children }) {
  return (
    <Reveal className="mb-10 max-w-2xl">
      <p className="eyebrow mb-3">{label}</p>
      <h2 className="text-4xl font-extrabold sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-lg text-muted">{children}</p>}
    </Reveal>
  )
}
