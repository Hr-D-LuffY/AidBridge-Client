'use client'

import { Power, Radar } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Switch } from '@/components/shared/switch'
import { getErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils'
import type { DispatchSettings } from '@/types'
import { useUpdateDispatchSettings } from '../dispatch.queries'
import { formatMinutes } from '../dispatch.view'

// The top of the settings page: whether automatic dispatch is running, said big and in words, with the three
// numbers that matter most beside it. The switch is saved on its own (not with the form below), and flipping
// it asks first in both directions.
export function KillSwitchCard({ settings }: { settings: DispatchSettings }) {
  const { enabled } = settings
  const update = useUpdateDispatchSettings()
  const [asking, setAsking] = useState(false)

  function confirm() {
    update.mutate(
      { enabled: !enabled },
      {
        onSuccess: () =>
          toast.success(enabled ? 'Automatic dispatch is off.' : 'Automatic dispatch is on.'),
        onError: (error) =>
          toast.error('Could not change it', { description: getErrorMessage(error) }),
        onSettled: () => setAsking(false),
      },
    )
  }

  const facts = [
    `Critical requests wait ${formatMinutes(settings.waitMinutes.critical)}`,
    `${settings.volunteersPerRound} volunteers asked per round`,
    `Searches up to ${settings.maxRadiusKm} km`,
  ]

  return (
    <section
      aria-labelledby="kill-switch-heading"
      className={cn(
        'relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl border p-5 sm:p-7',
        enabled ? 'border-success/30 bg-success-soft' : 'border-destructive/40 bg-destructive-soft',
      )}
    >
      {/* Rings, as on the radar of the home page: only decoration, so hidden from screen readers. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className={cn(
          'pointer-events-none absolute -top-10 -right-10 -z-10 size-72 opacity-25',
          enabled ? 'text-success' : 'text-destructive',
        )}
      >
        {[90, 66, 42, 20].map((radius) => (
          <circle
            key={radius}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
        <circle cx="100" cy="100" r="5" fill="currentColor" />
      </svg>

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-sm"
          >
            {enabled ? (
              <Radar className="size-7 text-success" />
            ) : (
              <Power className="size-7 text-destructive" />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              Automatic dispatch
            </p>
            <h2
              id="kill-switch-heading"
              className={cn(
                'text-2xl font-bold text-balance sm:text-3xl',
                enabled ? 'text-success' : 'text-destructive',
              )}
            >
              <span id="kill-switch-state">{enabled ? 'On' : 'Off'}</span>
              <span className="sr-only">: </span>
              <span className="text-foreground">
                {enabled ? ' offering requests on its own' : ' handled by hand only'}
              </span>
            </h2>
            <p id="kill-switch-hint" className="max-w-xl text-sm text-pretty">
              {enabled
                ? 'The system offers waiting requests to volunteers on its own, widens the search when nobody answers, and checks that accepted volunteers set off.'
                : 'No new offers are sent, the search is not widened and nobody is checked for setting off. Offers already out still expire. Requests wait until you switch it on or assign them by hand.'}
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onChange={() => setAsking(true)}
          labelledBy="kill-switch-heading"
          describedBy="kill-switch-hint"
          pending={update.isPending}
        />
      </div>

      <ul className="flex flex-wrap gap-2">
        {facts.map((fact) => (
          <li
            key={fact}
            className="rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium tabular-nums"
          >
            {fact}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={asking}
        onOpenChange={(next) => {
          if (!update.isPending && !next) setAsking(false)
        }}
        title={enabled ? 'Stop automatic dispatch?' : 'Start automatic dispatch?'}
        description={
          enabled
            ? 'No new offers are sent, the search is not widened and nobody is checked for setting off. Offers already out still expire. Requests wait until you switch it on again or assign them by hand.'
            : 'The system starts offering waiting requests to volunteers again, including requests that have been waiting while it was off.'
        }
        confirmLabel={enabled ? 'Stop dispatch' : 'Start dispatch'}
        cancelLabel={enabled ? 'Keep it on' : 'Keep it off'}
        tone={enabled ? 'danger' : 'neutral'}
        pending={update.isPending}
        onConfirm={confirm}
      />
    </section>
  )
}
