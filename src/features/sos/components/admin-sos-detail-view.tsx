'use client'

import { MessageSquare, Phone, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { ChatPanel } from '@/features/message/components/chat-panel'
import { usePolling } from '@/hooks/use-polling'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Priority, ResolvedBy, type SosPerson, SosStatus } from '@/types'
import { isSosFinished, useSetSosPriority, useSosQuery } from '../sos.queries'
import { SosLocationPanel } from './sos-location-panel'
import { SosMedia } from './sos-media'
import { SosProgress } from './sos-progress'

const PRIORITY_OPTIONS = [
  { value: Priority.CRITICAL, label: 'Critical' },
  { value: Priority.HIGH, label: 'High' },
  { value: Priority.MEDIUM, label: 'Medium' },
  { value: Priority.LOW, label: 'Low' },
] as const

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Person({ label, person }: { label: string; person: SosPerson }) {
  return (
    <Panel title={label}>
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 font-medium">
          <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
          {person.name}
        </p>
        <a
          href={`tel:${person.phone}`}
          className="flex min-h-11 w-fit items-center gap-2 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Phone aria-hidden="true" className="size-4" />
          {person.phone}
        </a>
      </div>
    </Panel>
  )
}

// One request as an admin sees it: everything the victim wrote, both people with their phones, the
// conversation (read only), and the priority, which only an admin can change. Asked for again every 15
// seconds while the request is open, so the status keeps up.
export function AdminSosDetailView({ id }: { id: string }) {
  const poll = usePolling(POLL_INTERVAL_MS.sosStatus)
  const { data: sos } = useSosQuery(id, poll)
  const setPriority = useSetSosPriority(id)

  // The server page loaded it, so it is in the cache; this only guards the type.
  if (!sos) return null

  const open = !isSosFinished(sos.status)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: '/admin/sos', label: 'SOS requests' }}
        title={sos.address || `Request from ${sos.victim.name}`}
        description={`Raised ${formatRelativeTime(sos.createdAt)}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="sos" status={sos.status} />
        <PriorityBadge priority={sos.priority} />
      </div>

      <SosProgress status={sos.status} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          {sos.assignedVolunteer || !open ? (
            <ChatPanel
              sosId={sos.id}
              live={Boolean(sos.assignedVolunteer) && open}
              readOnly
              closedNote="This request has ended, so the conversation is closed."
            />
          ) : (
            <Panel title="Messages">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MessageSquare aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                No volunteer has taken this request yet, so there is no conversation.
              </p>
            </Panel>
          )}

          <Panel title="What was asked for">
            <ReliefBadges categories={sos.needs} />
            {sos.description ? (
              <p className="text-pretty whitespace-pre-line">{sos.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No extra details.</p>
            )}
          </Panel>

          <Panel title="Photos and videos">
            {sos.media.length > 0 ? (
              <SosMedia media={sos.media} />
            ) : (
              <p className="text-sm text-muted-foreground">Nothing attached.</p>
            )}
          </Panel>

          {!open && sos.resolvedAt && (
            <Panel title="How it ended">
              <p className="text-sm">
                {sos.status === SosStatus.RESCUED ? 'Rescued' : 'Closed'}
                {sos.resolvedBy === ResolvedBy.ADMIN ? ' by an administrator' : ''} on{' '}
                {formatDateTime(sos.resolvedAt)}.
              </p>
              {sos.resolveReason && (
                <p className="rounded-xl bg-muted p-3 text-sm">
                  <span className="text-muted-foreground">Reason: </span>
                  {sos.resolveReason}
                </p>
              )}
            </Panel>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Priority">
            <fieldset
              className="flex min-w-0 flex-wrap gap-2 border-0 p-0"
              disabled={setPriority.isPending}
            >
              <legend className="sr-only">Priority of this request</legend>
              {PRIORITY_OPTIONS.map((option) => {
                const selected = option.value === sos.priority
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      if (!selected) setPriority.mutate(option.value)
                    }}
                    className={cn(
                      'min-h-11 cursor-pointer rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
                      selected
                        ? 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'border-input bg-card hover:bg-muted',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </fieldset>
            <p className="text-sm text-muted-foreground">
              Volunteers see the most urgent requests first on their map.
            </p>
          </Panel>

          <Person label="Victim" person={sos.victim} />

          {sos.assignedVolunteer ? (
            <Person label="Volunteer" person={sos.assignedVolunteer} />
          ) : (
            <Panel title="Volunteer">
              <p className="text-sm text-muted-foreground">No volunteer has taken this yet.</p>
            </Panel>
          )}

          <SosLocationPanel sos={sos} />
        </div>
      </div>
    </div>
  )
}
