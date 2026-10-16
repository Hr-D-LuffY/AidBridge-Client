'use client'

import { ExternalLink, Pencil, Phone, Trash2, UserMinus, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OCCUPANCY_STEPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ManagedCamp } from '@/types'
import { useChangeOccupancy, useUnassignVolunteer } from '../camp.queries'
import { campDirectionsUrl, isCampFull } from '../camp.view'
import { OccupancyBar } from './occupancy-bar'

const stepLabel = (step: number) => (step > 0 ? `+${step}` : `−${Math.abs(step)}`)

const stepName = (step: number, camp: string) => {
  const people = `${Math.abs(step)} ${Math.abs(step) === 1 ? 'person' : 'people'}`
  return step > 0 ? `Check ${people} in to ${camp}` : `Check ${people} out of ${camp}`
}

type NgoCampCardProps = {
  camp: ManagedCamp
  onEdit: () => void
  onDelete: () => void
  onAssign: () => void
}

// One camp as the NGO that runs it sees it: how full it is with check-in buttons, the volunteers on its
// team, and the actions. A check-in changes the count at once and goes back if the server refuses; a
// step that would pass the capacity or go below zero is off, so it is never offered in the first place.
export function NgoCampCard({ camp, onEdit, onDelete, onAssign }: NgoCampCardProps) {
  const changeOccupancy = useChangeOccupancy()
  const unassign = useUnassignVolunteer(camp.id)
  const full = isCampFull(camp)

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-balance">
            {camp.name}
            <Badge
              variant="secondary"
              className={cn(
                'h-6 px-2.5',
                camp.isActive ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground',
              )}
            >
              {camp.isActive ? 'Open' : 'Closed'}
            </Badge>
          </h3>
          {camp.address && <p className="text-sm text-muted-foreground">{camp.address}</p>}
        </div>
        <a
          href={campDirectionsUrl(camp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          Map
          <span className="sr-only"> of {camp.name} (opens in a new tab)</span>
        </a>
      </header>

      <section aria-label={`People in ${camp.name}`} className="flex flex-col gap-2">
        <OccupancyBar camp={camp} />
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{camp.currentOccupancy}</span> of{' '}
          <span className="tabular-nums">{camp.capacity}</span> people ·{' '}
          {full ? (
            <span className="font-semibold text-warning">full</span>
          ) : (
            <span>
              <span className="font-semibold tabular-nums">{camp.availableSpots}</span> places free
            </span>
          )}
        </p>
        <fieldset className="flex min-w-0 flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Check people in or out of {camp.name}</legend>
          {OCCUPANCY_STEPS.map((step) => {
            const next = camp.currentOccupancy + step
            return (
              <Button
                key={step}
                type="button"
                variant="outline"
                className="h-10 min-w-14 px-3 tabular-nums"
                disabled={next < 0 || next > camp.capacity}
                onClick={() => changeOccupancy.mutate({ campId: camp.id, delta: step })}
              >
                {stepLabel(step)}
                <span className="sr-only"> {stepName(step, camp.name)}</span>
              </Button>
            )
          })}
        </fieldset>
      </section>

      <section aria-label={`Volunteers at ${camp.name}`} className="flex flex-col">
        <h4 className="text-sm font-semibold">Volunteers on this camp</h4>
        {camp.assignedVolunteers.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            No one is assigned yet. Assigned volunteers see this camp's stock and can hand it out.
          </p>
        ) : (
          <ul className="divide-y">
            {camp.assignedVolunteers.map((volunteer) => (
              <li
                key={volunteer.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{volunteer.name}</span>
                  {volunteer.phone ? (
                    <a
                      href={`tel:${volunteer.phone}`}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-sm text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
                    >
                      <Phone aria-hidden="true" className="size-3.5" />
                      {volunteer.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">No phone number</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 gap-1.5 px-3 text-muted-foreground"
                  disabled={unassign.isPending && unassign.variables?.id === volunteer.id}
                  onClick={() => unassign.mutate(volunteer)}
                >
                  <UserMinus aria-hidden="true" />
                  Remove
                  <span className="sr-only">
                    {' '}
                    {volunteer.name} from {camp.name}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-auto flex flex-wrap gap-2 border-t pt-4">
        <Button type="button" variant="outline" className="h-10 gap-1.5 px-3" onClick={onAssign}>
          <UserPlus aria-hidden="true" />
          Assign volunteer
        </Button>
        <Button type="button" variant="outline" className="h-10 gap-1.5 px-3" onClick={onEdit}>
          <Pencil aria-hidden="true" />
          Edit
          <span className="sr-only"> {camp.name}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-1.5 px-3 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 aria-hidden="true" />
          Delete
          <span className="sr-only"> {camp.name}</span>
        </Button>
      </footer>
    </article>
  )
}
