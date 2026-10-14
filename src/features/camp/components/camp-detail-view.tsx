import { Building2, ExternalLink, MapPin, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PlacesMap } from '@/components/shared/places-map'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CampSummary } from '@/types'
import {
  CAMP_MAP_LEGEND,
  campDirectionsUrl,
  formatCampGps,
  isCampFull,
  toMapPlace,
} from '../camp.view'

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info"
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="break-words">{children}</dd>
      </div>
    </div>
  )
}

// One relief camp: how many places are left, who runs it, where it is, a map and directions. Plain
// markup with no hooks of its own, so the server page renders it (the map loads in the browser).
export function CampDetailView({ camp }: { camp: CampSummary }) {
  const full = isCampFull(camp)
  const filled = Math.min(100, Math.round((camp.currentOccupancy / camp.capacity) * 100))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: '/dashboard/camps', label: 'Relief camps' }}
        title={camp.name}
        description={camp.ngo.name ? `Run by ${camp.ngo.name}` : undefined}
        actions={
          <a
            href={campDirectionsUrl(camp)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), 'h-11 gap-2 px-5')}
          >
            <ExternalLink aria-hidden="true" />
            Get directions
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          <section
            aria-labelledby="camp-room-heading"
            className={cn(
              'flex flex-col gap-3 rounded-2xl border p-4 sm:p-5',
              full ? 'border-warning/40 bg-warning-soft' : 'border-success/40 bg-success-soft',
            )}
          >
            <h2 id="camp-room-heading" className="text-base font-semibold">
              {full ? 'Full right now' : 'Room available'}
            </h2>
            <p className="font-heading text-4xl tabular-nums">
              {camp.availableSpots}
              <span className="text-base font-normal text-muted-foreground">
                {' '}
                {camp.availableSpots === 1 ? 'place' : 'places'} free of {camp.capacity}
              </span>
            </p>
            <div
              role="progressbar"
              aria-label={`${camp.name} is ${filled}% full`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={filled}
              className="h-2.5 overflow-hidden rounded-full bg-card/70"
            >
              <div
                className={cn('h-full rounded-full', full ? 'bg-warning' : 'bg-success')}
                style={{ width: `${filled}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {camp.currentOccupancy} of {camp.capacity} places are taken. The number changes as the
              camp takes people in, so check again before you travel.
            </p>
          </section>

          <section
            aria-labelledby="camp-facts-heading"
            className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5"
          >
            <h2 id="camp-facts-heading" className="text-base font-semibold">
              About this camp
            </h2>
            <dl className="flex flex-col gap-4">
              {camp.ngo.name && (
                <Fact icon={Building2} label="Run by">
                  {camp.ngo.name}
                </Fact>
              )}
              <Fact icon={MapPin} label="Address">
                {camp.address ?? <span className="text-muted-foreground">No address given.</span>}
              </Fact>
              <Fact icon={Users} label="Capacity">
                {camp.capacity} places
              </Fact>
              <Fact icon={MapPin} label="GPS">
                <span className="font-mono text-sm">{formatCampGps(camp)}</span>
              </Fact>
            </dl>
          </section>
        </div>

        <PlacesMap
          className="h-96 lg:h-[34rem]"
          you={null}
          places={[toMapPlace(camp)]}
          legend={CAMP_MAP_LEGEND.filter((item) => item.tone !== 'you')}
        />
      </div>
    </div>
  )
}
