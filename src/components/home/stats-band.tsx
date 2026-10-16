import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { STATS } from './home-content'

// A full-width band in the inverted colours (dark on a light page, light on a dark one) with four big
// numbers and thin dividers: no boxes. The numbers are fixed limits of the product, not usage counts, and
// the heading says so.
export function StatsBand() {
  return (
    <section
      id="numbers"
      aria-labelledby="numbers-heading"
      className="scroll-mt-20 bg-foreground text-background"
    >
      <div className="page-container py-14 sm:py-16">
        <Reveal className="flex flex-col gap-1">
          <p className="text-sm font-bold tracking-widest text-primary uppercase">By design</p>
          <h2 id="numbers-heading" className="text-2xl text-balance sm:text-3xl">
            The rules the platform is built on
          </h2>
          <p className="text-background/70">
            Fixed limits, enforced by the server on every request.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4" gap={0.1}>
          {STATS.map((stat, index) => (
            <StaggerItem
              key={stat.label}
              className={index === 0 ? 'pr-4' : 'border-l border-background/20 pl-5 sm:pl-8'}
            >
              <dl className="flex flex-col gap-2">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-5xl font-extrabold tracking-tight sm:text-6xl">{stat.value}</dd>
                <dd className="max-w-48 text-sm text-pretty text-background/70">{stat.label}</dd>
              </dl>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
