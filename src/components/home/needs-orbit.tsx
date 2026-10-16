import { NEEDS } from '@/components/landing/landing-content'
import { SectionHeading } from '@/components/landing/section-heading'
import { Emblem } from '@/components/layout/brand-logo'
import { Reveal } from '@/components/motion/reveal'
import { Marquee } from './marquee'

const RADIUS = 38

// Place the six needs on a circle around the emblem. Rounded so the server and the browser print the
// same numbers.
function polar(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI
  return {
    left: `${(50 + RADIUS * Math.sin(angle)).toFixed(2)}%`,
    top: `${(50 - RADIUS * Math.cos(angle)).toFixed(2)}%`,
  }
}

// What a request can ask for. On a desktop the six needs orbit the emblem with the list beside them; on
// a phone it is just the list. Under it, a slow ticker of the kinds of disaster an incident can be
// filed under.
export function NeedsOrbit() {
  return (
    <section
      id="requests"
      aria-labelledby="requests-heading"
      className="scroll-mt-20 overflow-hidden border-y bg-card/50 py-16 sm:py-20"
    >
      <div className="page-container grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            id="requests-heading"
            eyebrow="What you can ask for"
            title="Six kinds of relief, the same on both sides"
            text="A request and a camp's stock use one list, so a volunteer can see at a glance whether what is needed is on the shelf."
          />
          <Reveal>
            <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {NEEDS.map(({ icon: Icon, label, text }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="hidden lg:block">
          <div
            role="img"
            aria-label="The six kinds of relief arranged around the AidBridge emblem"
            className="relative mx-auto aspect-square w-full max-w-md"
          >
            {[96, 70, 44].map((size) => (
              <span
                key={size}
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-foreground/20"
                style={{ width: `${size}%`, height: `${size}%` }}
              />
            ))}
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card shadow-float ring-1 ring-border"
            >
              <Emblem className="h-20 w-auto" />
            </span>
            {NEEDS.map(({ icon: Icon, label }, index) => (
              <span
                key={label}
                aria-hidden="true"
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={polar(index, NEEDS.length)}
              >
                <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-card">
                  <Icon className="size-6" />
                </span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold ring-1 ring-border">
                  {label}
                </span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="mt-14">
        <p className="page-container mb-3 text-sm font-semibold text-muted-foreground">
          Incidents can be filed for
        </p>
        <Marquee />
      </div>
    </section>
  )
}
