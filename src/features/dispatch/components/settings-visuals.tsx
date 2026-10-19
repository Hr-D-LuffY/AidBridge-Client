import {
  BellRing,
  Flag,
  Hourglass,
  type LucideIcon,
  Radar,
  TriangleAlert,
  UserRoundCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SettingsFormValues } from '../dispatch.schema'
import { sumWeights, toNumber, WEIGHT_FIELDS, WEIGHT_TOTAL_PERCENT } from '../dispatch.schema'
import { formatMinutes, getRingRadii } from '../dispatch.view'

// Pictures of the numbers being edited. They are drawn from the form's current values, so they change as
// the admin types, and every picture has its words beside it: nothing is shown by colour or shape alone.

const km = (value: number) => (Number.isFinite(value) ? `${value} km` : '–')
const count = (value: number) => (Number.isFinite(value) ? String(value) : '–')

// The search area growing round by round, as rings around the request. The rings are drawn on a square-root
// scale so that a first ring of 10 km is still visible next to a widest one of 80 km.
export function SearchRings({ radii }: { radii: number[] }) {
  if (radii.length === 0) {
    return (
      <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
        Fill in the distances to see the search area.
      </p>
    )
  }

  const widest = radii[radii.length - 1] ?? 1
  const outer = 86
  const scale = (distance: number) => outer * Math.sqrt(distance / widest)

  return (
    <figure className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`The search starts at ${radii[0]} km${radii.length > 1 ? ` and widens to ${widest} km` : ''}`}
        className="size-full max-w-60"
      >
        {[...radii].reverse().map((radius, index) => (
          <circle
            key={radius}
            cx="100"
            cy="100"
            r={scale(radius)}
            strokeWidth="1.5"
            className={cn(
              'stroke-primary/60',
              index % 2 === 0 ? 'fill-primary/5' : 'fill-primary/10',
            )}
          />
        ))}
        {radii.map((radius, index) => (
          <text
            key={radius}
            x="100"
            y={100 - scale(radius) + 11}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-semibold"
          >
            {index + 1}
          </text>
        ))}
        <circle cx="100" cy="100" r="4.5" className="fill-primary" />
      </svg>
      <figcaption className="text-center text-xs text-muted-foreground">
        The dot is the request. Each ring is one round of the search.
      </figcaption>
    </figure>
  )
}

type Step = { icon: LucideIcon; title: string; detail: React.ReactNode }

// "What happens to a request", step by step, in the numbers as they stand in the form.
export function FlowPreview({ values }: { values: SettingsFormValues }) {
  const minutes = (name: keyof SettingsFormValues) => formatMinutes(toNumber(values[name]))
  const radii = getRingRadii(
    toNumber(values.startRadiusKm),
    toNumber(values.radiusFactor),
    toNumber(values.maxRadiusKm),
    toNumber(values.maxRounds),
  )

  const steps: Step[] = [
    {
      icon: Flag,
      title: 'A request is raised',
      detail: 'Volunteers nearby can see it on their map straight away.',
    },
    {
      icon: Hourglass,
      title: 'It waits before the first offer',
      detail: (
        <>
          Critical {minutes('waitCritical')}, high {minutes('waitHigh')}, medium{' '}
          {minutes('waitMedium')}, low {minutes('waitLow')}.
        </>
      ),
    },
    {
      icon: BellRing,
      title: `Round 1: asks ${count(toNumber(values.volunteersPerRound))} volunteers`,
      detail: (
        <>
          Within {km(radii[0] ?? Number.NaN)}, best-ranked first. They have{' '}
          {minutes('offerWindowMinutes')} to answer ({minutes('criticalOfferWindowMinutes')} for a
          critical request). The first to accept gets it.
        </>
      ),
    },
    {
      icon: Radar,
      title: 'Nobody accepts? The search widens',
      detail:
        radii.length > 1
          ? radii.slice(1).map((radius, index) => (
              <span key={radius} className="block">
                Round {index + 2}: {km(radius)}
                {index + 2 === 3 && ', and the request is marked one step more urgent'}
              </span>
            ))
          : 'The search stays at the same distance every round.',
    },
    {
      icon: TriangleAlert,
      title: `After ${count(toNumber(values.maxRounds))} rounds: no volunteer found`,
      detail: (
        <>
          Admins and NGOs are told. The system keeps trying every {minutes('retryIntervalMinutes')}.
        </>
      ),
    },
    {
      icon: UserRoundCheck,
      title: 'A volunteer accepts',
      detail: (
        <>
          They must set off within {minutes('setOffWithinMinutes')} (
          {minutes('criticalSetOffWithinMinutes')} for a critical request), or the request goes back
          to the queue.
        </>
      ),
    },
  ]

  return (
    <ol className="flex flex-col">
      {steps.map(({ icon: Icon, title, detail }, index) => (
        <li key={title} className="relative flex gap-3 pb-4 last:pb-0">
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="absolute top-9 bottom-0 left-4 w-px bg-border" />
          )}
          <span
            aria-hidden="true"
            className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <Icon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5 pt-1">
            <p className="text-sm font-semibold text-balance">{title}</p>
            <p className="text-sm text-pretty text-muted-foreground">{detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

// One colour per part of the rank, from the chart tokens. The legend carries the words and the number.
export const WEIGHT_COLOR: Record<string, string> = {
  wDistance: 'bg-chart-2',
  wReliability: 'bg-chart-4',
  wLoad: 'bg-chart-3',
  wSkillMatch: 'bg-chart-5',
  wNoShow: 'bg-chart-1',
}

// The five shares as one bar, with a legend that names each one. The bar is scaled to 100, so a total
// under 100 leaves a gap and a total over 100 is squeezed, and the total line says which it is.
export function WeightsBar({ values }: { values: SettingsFormValues }) {
  const total = sumWeights(values)
  const ok = total === WEIGHT_TOTAL_PERCENT
  const shown = WEIGHT_FIELDS.map((spec) => {
    const value = toNumber(values[spec.name])
    return { spec, value: Number.isFinite(value) && value > 0 ? value : 0 }
  })
  const scale = Math.max(Number.isFinite(total) ? total : 0, WEIGHT_TOTAL_PERCENT)

  return (
    <div className="flex flex-col gap-3">
      <div
        role="img"
        aria-label={`Ranking shares: ${shown.map(({ spec, value }) => `${spec.label} ${value} percent`).join(', ')}`}
        className="flex h-5 w-full overflow-hidden rounded-full border bg-muted"
      >
        {shown.map(({ spec, value }) => (
          <span
            key={spec.name}
            className={WEIGHT_COLOR[spec.name]}
            style={{ width: `${(value / scale) * 100}%` }}
          />
        ))}
      </div>
      <ul className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
        {shown.map(({ spec, value }) => (
          <li key={spec.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn('size-3 shrink-0 rounded-sm', WEIGHT_COLOR[spec.name])}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{spec.label}</span>
            <span className="font-semibold tabular-nums">{value}%</span>
          </li>
        ))}
      </ul>
      <p
        aria-live="polite"
        className={cn(
          'rounded-lg px-3 py-2 text-sm font-semibold tabular-nums',
          ok ? 'bg-success-soft text-success' : 'bg-destructive-soft text-destructive',
        )}
      >
        Total {Number.isFinite(total) ? total : '–'} of {WEIGHT_TOTAL_PERCENT}
        {ok ? '. Ready to save.' : '. It must be exactly 100 before you can save.'}
      </p>
    </div>
  )
}
