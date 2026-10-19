'use client'

import { Ban, ExternalLink, Phone, Star, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { ReliefBadges } from '@/components/shared/relief-category'
import { RequestedSkills } from '@/components/shared/skill-chips'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { ChatPanel } from '@/features/message/components/chat-panel'
import { SosLocationPanel } from '@/features/sos/components/sos-location-panel'
import { SosMedia } from '@/features/sos/components/sos-media'
import { usePolling } from '@/hooks/use-polling'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { getDirectionsUrl } from '@/lib/geo'
import { cn } from '@/lib/utils'
import { TaskStatus } from '@/types'
import { isActiveTaskStatus } from '../task.params'
import { useTaskQuery } from '../task.queries'
import { getTaskTitle, hasFullSos } from '../task.view'
import { TaskActions } from './task-actions'
import { TaskProgress } from './task-progress'

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  )
}

type TaskDetailViewProps = { id: string }

// One task in full: the next step, the person and how to reach them, the chat, what they asked for,
// photos, and a map with directions. It asks again every 15 seconds while the task is active, so a
// request the victim closed shows up here as cancelled.
export function TaskDetailView({ id }: TaskDetailViewProps) {
  const router = useRouter()
  const poll = usePolling(POLL_INTERVAL_MS.sosStatus)
  const { data: task } = useTaskQuery(id, poll)

  // The server page found it, so it is in the cache; this only guards the type. A task that is not
  // (or no longer) in the full view has nothing to show here.
  if (!task || !hasFullSos(task)) return null

  const { sosRequest: sos } = task
  const active = isActiveTaskStatus(task.status)
  const title = getTaskTitle(task)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: '/volunteer/tasks', label: 'My tasks' }}
        title={title}
        description={`Accepted ${formatRelativeTime(task.acceptedAt ?? task.createdAt)}`}
        actions={
          <a
            href={getDirectionsUrl(sos.location)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-11 gap-2 px-4')}
          >
            <ExternalLink aria-hidden="true" />
            Get directions
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="task" status={task.status} />
        <PriorityBadge priority={sos.priority} />
        {task.status === TaskStatus.COMPLETED && task.isRated && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star aria-hidden="true" className="size-4 text-warning" />
            They rated you
          </span>
        )}
      </div>

      <TaskProgress status={task.status} />

      {task.status === TaskStatus.CANCELLED && (
        <div className="flex gap-3 rounded-xl border bg-muted p-4 text-sm">
          <Ban aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">The person closed this request</p>
            <p>You do not need to go. Your other tasks are not affected.</p>
            {task.notes && <p className="text-muted-foreground">{task.notes}</p>}
          </div>
        </div>
      )}

      {task.status === TaskStatus.COMPLETED && task.completedAt && (
        <p className="text-sm text-muted-foreground">
          Completed on {formatDateTime(task.completedAt)}. Thank you for helping.
        </p>
      )}

      {active && (
        <Panel title="Next step">
          <TaskActions task={task} onBackedOut={() => router.push('/volunteer/tasks')} />
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          <ChatPanel
            sosId={sos.id}
            live={active}
            closedNote="This task has ended, so the conversation is closed."
          />

          <Panel title="What they asked for">
            <ReliefBadges categories={sos.needs} />
            <RequestedSkills skills={sos.requiredSkills} />
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
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="The person you are helping">
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 font-medium">
                <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
                {sos.victim.name}
              </p>
              {sos.victim.phone ? (
                <a
                  href={`tel:${sos.victim.phone}`}
                  className="flex min-h-11 w-fit items-center gap-2 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Phone aria-hidden="true" className="size-4" />
                  {sos.victim.phone}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">No phone number was given.</p>
              )}
            </div>
          </Panel>

          <SosLocationPanel sos={sos} />

          {active && (
            <p className="text-sm text-muted-foreground">
              Need something from a camp?{' '}
              <Link
                href="/volunteer/camps"
                className="font-medium text-link underline-offset-4 hover:underline"
              >
                See your camps and their stock
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
