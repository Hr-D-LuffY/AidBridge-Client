'use client'

import {
  BellRing,
  Hourglass,
  type LucideIcon,
  Radar,
  RotateCcw,
  Scale,
  Timer,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { setServerFieldError } from '@/components/forms/server-errors'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PriorityBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { DispatchSettingsResult, Priority } from '@/types'
import { useDispatchSettingsQuery, useUpdateDispatchSettings } from '../dispatch.queries'
import {
  buildSettingsFormSchema,
  type ChangeLine,
  describeChanges,
  type FieldSpec,
  getRange,
  OFFER_FIELDS,
  SEARCH_FIELDS,
  SET_OFF_FIELDS,
  type SettingsFormValues,
  toChanges,
  toFieldName,
  toFormValues,
  toNumber,
  WAIT_FIELDS,
  WEIGHT_FIELDS,
} from '../dispatch.schema'
import { getRingRadii } from '../dispatch.view'
import { KillSwitchCard } from './kill-switch-card'
import { FlowPreview, SearchRings, WEIGHT_COLOR, WeightsBar } from './settings-visuals'

type StepCardProps = {
  step: number
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
}

// One group of settings: a numbered badge and an icon so the page reads as five steps, in the order a
// request goes through them.
function StepCard({ step, icon: Icon, title, description, children }: StepCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sidebar-accent text-sidebar-accent-foreground"
        >
          <Icon className="size-6" />
          <span className="absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {step}
          </span>
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-lg font-semibold text-balance">
            <span className="sr-only">Step {step}: </span>
            {title}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function ChangeList({ lines }: { lines: ChangeLine[] }) {
  return (
    <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto rounded-xl bg-muted p-3 text-sm">
      {lines.map((line) => (
        <li key={line.name}>
          <span className="font-medium">{line.label}:</span>{' '}
          <span className="tabular-nums">
            {line.from} → {line.to} {line.unit}
          </span>
        </li>
      ))}
    </ul>
  )
}

// A wait box is coloured like its priority everywhere else in the app, with a bar that shows how long it is
// next to the other three.
const WAIT_TILE: Record<string, { priority: Priority; tile: string; bar: string }> = {
  waitCritical: {
    priority: 'critical',
    tile: 'border-destructive/40 bg-destructive-soft',
    bar: 'bg-destructive',
  },
  waitHigh: { priority: 'high', tile: 'border-high/40 bg-high-soft', bar: 'bg-high' },
  waitMedium: { priority: 'medium', tile: 'border-warning/40 bg-warning-soft', bar: 'bg-warning' },
  waitLow: { priority: 'low', tile: 'border-info/40 bg-info-soft', bar: 'bg-info' },
}

type LoadedProps = { result: DispatchSettingsResult }

// The editable part. It is rebuilt (see the key in DispatchSettingsView) whenever the saved numbers change,
// so after a save, a reset or another admin's save the boxes show what the server now holds.
function SettingsForm({ result }: LoadedProps) {
  const { settings, defaults, limits } = result
  const update = useUpdateDispatchSettings()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saving, setSaving] = useState<{ values: SettingsFormValues; lines: ChangeLine[] } | null>(
    null,
  )
  const [resetting, setResetting] = useState<ChangeLine[] | null>(null)

  const form = useAppForm({
    defaultValues: toFormValues(settings),
    validators: { onChange: buildSettingsFormSchema(limits) },
    onSubmit: ({ value }) => {
      setServerError(null)
      const lines = describeChanges(value, settings)
      if (lines.length === 0) {
        toast.info('Nothing was changed.')
        return
      }
      setSaving({ values: value, lines })
    },
  })

  function handleError(error: unknown) {
    if (isApiError(error) && error.isConflict) {
      toast.error('Another admin saved first', {
        description:
          'The form now shows their settings. Check it and save again if you still want your change.',
      })
      return
    }
    let mapped = false
    if (isApiError(error)) {
      for (const [path, message] of Object.entries(error.fieldErrors)) {
        const name = toFieldName(path)
        if (!name) continue
        mapped = true
        setServerFieldError(form, name, message)
      }
    }
    if (!mapped) setServerError(getErrorMessage(error))
  }

  function confirmSave() {
    if (!saving) return
    update.mutate(toChanges(saving.values, settings), {
      onSuccess: () => toast.success('Dispatch settings saved.'),
      onError: handleError,
      onSettled: () => setSaving(null),
    })
  }

  function askReset() {
    const lines = describeChanges(toFormValues(defaults), settings)
    if (lines.length === 0) {
      toast.info('The settings are already the defaults.')
      return
    }
    setResetting(lines)
  }

  function confirmReset() {
    update.mutate(toChanges(toFormValues(defaults), settings), {
      onSuccess: () => toast.success('Dispatch settings were reset to the defaults.'),
      onError: handleError,
      onSettled: () => setResetting(null),
    })
  }

  function hintFor(spec: FieldSpec) {
    const { min, max } = getRange(spec, limits)
    return `Between ${min} and ${max}. Default ${spec.read(defaults)}.`
  }

  function renderFields(specs: readonly FieldSpec[]) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {specs.map((spec) => (
          <form.AppField key={spec.name} name={spec.name}>
            {(field) => (
              <field.TextField
                label={`${spec.label} (${spec.unit})`}
                inputMode={spec.whole ? 'numeric' : 'decimal'}
                hint={hintFor(spec)}
              />
            )}
          </form.AppField>
        ))}
      </div>
    )
  }

  // The five share boxes sit under the bar, each with the colour it has in the bar.
  function renderWeightFields() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {WEIGHT_FIELDS.map((spec) => (
          <div key={spec.name} className="flex gap-3">
            <span
              aria-hidden="true"
              className={cn('mt-9 h-12 w-1.5 shrink-0 rounded-full', WEIGHT_COLOR[spec.name])}
            />
            <div className="min-w-0 flex-1">
              <form.AppField name={spec.name}>
                {(field) => (
                  <field.TextField
                    label={`${spec.label} (%)`}
                    inputMode="decimal"
                    hint={hintFor(spec)}
                  />
                )}
              </form.AppField>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <StepCard
          step={1}
          icon={Hourglass}
          title="Waiting before the first offer"
          description="How long a new request waits before volunteers are asked. Until then volunteers can already see it on their map. More urgent requests should wait less."
        >
          <form.Subscribe selector={(state) => state.values}>
            {(values) => {
              const longest = Math.max(
                1,
                ...WAIT_FIELDS.map((spec) => {
                  const value = toNumber(values[spec.name])
                  return Number.isFinite(value) ? value : 0
                }),
              )
              return (
                <div className="grid gap-3 sm:grid-cols-2">
                  {WAIT_FIELDS.map((spec) => {
                    const style = WAIT_TILE[spec.name]
                    const value = toNumber(values[spec.name])
                    const share = Number.isFinite(value) ? Math.max(0, value) / longest : 0
                    return (
                      <div
                        key={spec.name}
                        className={cn('flex flex-col gap-3 rounded-2xl border p-4', style?.tile)}
                      >
                        {style && <PriorityBadge priority={style.priority} className="w-fit" />}
                        <form.AppField name={spec.name}>
                          {(field) => (
                            <field.TextField
                              label="Waits (minutes)"
                              inputMode="numeric"
                              hint={hintFor(spec)}
                            />
                          )}
                        </form.AppField>
                        <div
                          aria-hidden="true"
                          className="h-2 w-full overflow-hidden rounded-full bg-background/70"
                        >
                          <div
                            className={cn('h-full rounded-full', style?.bar)}
                            style={{ width: `${share * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }}
          </form.Subscribe>
        </StepCard>

        <StepCard
          step={2}
          icon={BellRing}
          title="Offers"
          description="How many volunteers are asked at once, and how long they have to answer. The first to accept gets the request."
        >
          {renderFields(OFFER_FIELDS)}
          <form.Subscribe selector={(state) => toNumber(state.values.volunteersPerRound)}>
            {(asked) => {
              const shown = Number.isFinite(asked)
                ? Math.min(Math.max(Math.floor(asked), 0), 10)
                : 0
              return (
                <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
                  <span aria-hidden="true" className="flex flex-wrap gap-1">
                    {Array.from({ length: shown }, (_, index) => `volunteer-${index}`).map((id) => (
                      <UserRound key={id} className="size-5 text-primary" />
                    ))}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {shown === 0
                      ? 'Fill in how many volunteers are asked.'
                      : `${shown} ${shown === 1 ? 'volunteer is' : 'volunteers are'} asked in each round.`}
                  </p>
                </div>
              )
            }}
          </form.Subscribe>
        </StepCard>

        <StepCard
          step={3}
          icon={Radar}
          title="Widening the search"
          description="When nobody accepts, the search distance grows each round. After the last round the request is marked as having no volunteer, and the system keeps trying at the interval below. The second widening also raises the request's priority one step."
        >
          {renderFields(SEARCH_FIELDS)}
          <form.Subscribe selector={(state) => state.values}>
            {(values) => {
              const radii = getRingRadii(
                toNumber(values.startRadiusKm),
                toNumber(values.radiusFactor),
                toNumber(values.maxRadiusKm),
                toNumber(values.maxRounds),
              )
              return (
                <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                  {radii.length === 0
                    ? 'Fill in the distances to see the rounds.'
                    : `Rounds search ${radii.map((radius) => `${radius} km`).join(' → ')}.`}
                </p>
              )
            }}
          </form.Subscribe>
        </StepCard>

        <StepCard
          step={4}
          icon={Timer}
          title="After a volunteer accepts"
          description="A volunteer who accepts but does not set off in time loses the request, and it is offered to others again."
        >
          {renderFields(SET_OFF_FIELDS)}
        </StepCard>

        <StepCard
          step={5}
          icon={Scale}
          title="How volunteers are ranked"
          description="The best-ranked volunteers are asked first. Each part counts for a share of the score, and the five shares must add up to 100."
        >
          <form.Subscribe selector={(state) => state.values}>
            {(values) => <WeightsBar values={values} />}
          </form.Subscribe>
          {renderWeightFields()}
        </StepCard>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t bg-background/95 p-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
          <FormError message={serverError} />
          <form.Subscribe selector={(state) => state.values}>
            {(values) => {
              const changes = describeChanges(values, settings).length
              return (
                <p
                  aria-live="polite"
                  className="flex flex-wrap items-center gap-x-2 text-sm font-medium"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-2.5 rounded-full',
                      changes > 0 ? 'bg-warning' : 'bg-muted-foreground/40',
                    )}
                  />
                  {changes === 0
                    ? 'No unsaved changes'
                    : `${changes} unsaved ${changes === 1 ? 'change' : 'changes'}`}
                  <span className="font-normal text-muted-foreground">
                    · Last saved {formatRelativeTime(result.updatedAt)}. Every change is written to
                    the audit log.
                  </span>
                </p>
              )
            }}
          </form.Subscribe>
          <div className="flex flex-wrap gap-2">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="h-12 px-6 text-base font-semibold"
                  disabled={!canSubmit || isSubmitting || update.isPending}
                >
                  Review and save
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="outline"
              className="h-12 gap-2 px-5"
              disabled={update.isPending}
              onClick={askReset}
            >
              <RotateCcw aria-hidden="true" />
              Reset to defaults
            </Button>
          </div>
        </div>
      </div>

      <aside
        aria-labelledby="preview-heading"
        className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-5 lg:sticky lg:top-24"
      >
        <div className="flex flex-col gap-1">
          <h2 id="preview-heading" className="text-base font-semibold">
            How a request plays out
          </h2>
          <p className="text-sm text-muted-foreground">
            Changes as you type. Nothing is saved until you review and save.
          </p>
        </div>
        <form.Subscribe selector={(state) => state.values}>
          {(values) => (
            <>
              <SearchRings
                radii={getRingRadii(
                  toNumber(values.startRadiusKm),
                  toNumber(values.radiusFactor),
                  toNumber(values.maxRadiusKm),
                  toNumber(values.maxRounds),
                )}
              />
              <FlowPreview values={values} />
            </>
          )}
        </form.Subscribe>
      </aside>

      <ConfirmDialog
        open={saving !== null}
        onOpenChange={(next) => {
          if (!update.isPending && !next) setSaving(null)
        }}
        title="Save these dispatch settings?"
        description="They take effect on the engine's next pass, about a minute from now, for every request that has not been scheduled yet and for every new round. Requests already waiting keep the time they were given."
        confirmLabel="Save settings"
        cancelLabel="Keep editing"
        tone="neutral"
        pending={update.isPending}
        onConfirm={confirmSave}
      >
        {saving && <ChangeList lines={saving.lines} />}
      </ConfirmDialog>

      <ConfirmDialog
        open={resetting !== null}
        onOpenChange={(next) => {
          if (!update.isPending && !next) setResetting(null)
        }}
        title="Reset to the defaults?"
        description="This replaces the numbers below with the system's defaults and discards anything you have typed. The on/off switch is not changed."
        confirmLabel="Reset to defaults"
        cancelLabel="Keep my settings"
        pending={update.isPending}
        onConfirm={confirmReset}
      >
        {resetting && <ChangeList lines={resetting} />}
      </ConfirmDialog>
    </form>
  )
}

// Admin: the dispatch engine's timings, distances and ranking. A wrong value sends offers too early or
// never, so the page checks every number against the backend's bounds, confirms every save by listing what
// changes, shows what the numbers mean as you type, and keeps the on/off switch on a card of its own.
export function DispatchSettingsView() {
  const query = useDispatchSettingsQuery()
  const result = query.data

  let body: React.ReactNode
  if (!result) {
    body = query.isError ? (
      <ListErrorState onRetry={() => query.refetch()} />
    ) : (
      <div aria-busy="true" className="flex flex-col gap-4">
        <output className="sr-only">Loading the settings</output>
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-48 rounded-2xl" />
        ))}
      </div>
    )
  } else {
    body = (
      <>
        <KillSwitchCard settings={result.settings} />
        {/* Rebuilt when the saved numbers change (not when only the on/off switch does), so unsaved typing
            survives flipping the switch. */}
        <SettingsForm key={JSON.stringify(toFormValues(result.settings))} result={result} />
      </>
    )
  }

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <PageHeader
        back={{ href: '/admin/sos', label: 'SOS requests' }}
        title="Dispatch settings"
        description="How the system offers waiting requests to volunteers: when, to how many, how far, and how they are ranked."
      />
      {body}
    </div>
  )
}
