import { Phone, TriangleAlert } from 'lucide-react'
import { SectionHeading } from '@/components/landing/section-heading'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { EMERGENCY_CONTACTS } from '@/lib/site-config'
import { WHILE_YOU_WAIT } from './home-content'

// Two halves that do not look alike: a solid red alert panel with the main emergency number as a huge
// tap-to-call button, and a plain vertical timeline of what to do while help is on its way.
export function EmergencySection() {
  const [main, ...others] = EMERGENCY_CONTACTS

  return (
    <section
      id="emergency"
      aria-labelledby="emergency-heading"
      className="page-container scroll-mt-20 py-16 sm:py-20"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <Reveal>
          <div className="relative isolate flex h-full flex-col gap-6 overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10">
            <TriangleAlert
              aria-hidden="true"
              className="absolute -top-6 -right-6 -z-10 size-48 text-primary-foreground/10"
            />
            <div>
              <p className="text-sm font-bold tracking-widest uppercase opacity-90">
                In an emergency
              </p>
              <h2 id="emergency-heading" className="mt-2 text-3xl text-balance sm:text-4xl">
                Call first, then ask for help here
              </h2>
              <p className="mt-3 max-w-md text-pretty opacity-90">
                AidBridge coordinates the help that comes after. It does not replace the emergency
                services.
              </p>
            </div>

            {main && (
              <a
                href={`tel:${main.number}`}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-primary-foreground px-6 py-5 text-primary outline-none transition-transform focus-visible:ring-4 focus-visible:ring-primary-foreground/50 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{main.label}</span>
                  <span className="text-6xl leading-none font-extrabold tracking-tight">
                    {main.number}
                  </span>
                </span>
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Phone aria-hidden="true" className="size-6" />
                </span>
              </a>
            )}

            <ul className="flex flex-col gap-2">
              {others.map(({ number, label }) => (
                <li key={number}>
                  <a
                    href={`tel:${number}`}
                    className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-primary-foreground/40 px-4 py-2 text-sm outline-none transition-colors hover:bg-primary-foreground/10 focus-visible:ring-3 focus-visible:ring-primary-foreground/50"
                  >
                    <span className="text-pretty">{label}</span>
                    <span className="text-lg font-extrabold">{number}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            id="wait-heading"
            eyebrow="While you wait"
            title="Small things that keep you safer until help arrives"
          />
          <Stagger className="relative mt-8 flex flex-col gap-6" gap={0.12}>
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-3.5 w-px bg-linear-to-b from-primary via-border to-transparent"
            />
            {WHILE_YOU_WAIT.map((step, index) => (
              <StaggerItem key={step}>
                <div className="relative flex items-start gap-4 pl-0">
                  <span
                    aria-hidden="true"
                    className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-4 ring-background"
                  >
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-pretty">{step}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
