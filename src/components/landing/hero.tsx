import { Check } from 'lucide-react'
import Link from 'next/link'
import { AskForHelpLink, VolunteerLink } from './landing-cta-links'
import { RadarScene } from './radar-scene'

const PROMISES = [
  'Raise an SOS in a minute',
  'Volunteers are approved by an admin',
  'Your exact location stays private until someone accepts',
] as const

// First screen. The text is plain HTML with a CSS-only entrance (no JavaScript needed to show it), so
// the headline paints at once. Only the radar on the right runs client-side.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Colour behind the radar, and a faint grid that fades out toward the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_55%_at_75%_35%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent),radial-gradient(35%_40%_at_8%_95%,color-mix(in_oklch,var(--info)_16%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
      />

      <div className="page-container grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-28">
        <div className="flex flex-col items-start gap-6 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-3">
          <p className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-sm font-semibold backdrop-blur">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            Disaster response and relief coordination
          </p>

          <h1 className="text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            When disaster strikes, help should{' '}
            <span className="bg-linear-to-r from-primary to-high bg-clip-text whitespace-nowrap text-transparent">
              find you
            </span>
            .
          </h1>

          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            AidBridge connects people in crisis with volunteers nearby, relief camps and the NGOs
            that keep them stocked, on one shared picture, so no request goes unseen.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <AskForHelpLink className="w-full sm:w-auto" />
            <VolunteerLink className="w-full sm:w-auto" />
          </div>

          <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex items-center gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                </span>
                {promise}
              </li>
            ))}
          </ul>

          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-sm font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Log in
            </Link>
          </p>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <RadarScene />
        </div>
      </div>
    </section>
  )
}
