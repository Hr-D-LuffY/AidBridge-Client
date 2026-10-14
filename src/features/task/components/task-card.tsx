import { ArrowRight, Phone, UserRound } from 'lucide-react'
import Link from 'next/link'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { STATUS_SURFACE } from '@/features/sos/sos.surface'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FullTask } from '@/types'
import { getTaskTitle } from '../task.view'
import { TaskActions } from './task-actions'
import { TaskProgress } from './task-progress'

// One task being worked: who needs help and where, how far along it is, and what to do next. The
// card's colour is the colour of the request's step, as on the victim's own cards. The phone number is
// here because the task is accepted; it is a call link so it works from a phone with one tap.
export function TaskCard({ task }: { task: FullTask }) {
  const { sosRequest: sos } = task

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border p-4 sm:p-5',
        STATUS_SURFACE[sos.status],
      )}
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <StatusBadge kind="task" status={task.status} />
          <PriorityBadge priority={sos.priority} />
        </div>
        <h3 className="text-lg font-semibold text-balance">{getTaskTitle(task)}</h3>
        <p className="text-sm text-muted-foreground">
          Accepted {formatRelativeTime(task.acceptedAt ?? task.createdAt)}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
          {sos.victim.name}
        </span>
        {sos.victim.phone && (
          <a
            href={`tel:${sos.victim.phone}`}
            className="flex min-h-11 items-center gap-1.5 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Phone aria-hidden="true" className="size-4" />
            {sos.victim.phone}
          </a>
        )}
      </div>

      <ReliefBadges categories={sos.needs} />
      {sos.description && (
        <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">{sos.description}</p>
      )}

      <TaskProgress status={task.status} />

      <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
        <TaskActions task={task} />
        <Link
          href={`/volunteer/tasks/${task.id}`}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Details, map and chat
          <ArrowRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> for {getTaskTitle(task)}</span>
        </Link>
      </div>
    </article>
  )
}
