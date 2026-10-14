import { ListChecks } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FullTask } from '@/types'
import { getTaskTitle } from '../task.view'

// The tasks being worked, on the overview. Plain markup with no hooks, so the server page renders it.
export function ActiveTaskList({ tasks }: { tasks: FullTask[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No active tasks"
        description="When you accept a request it shows up here, and you can follow it until it is done."
        action={
          <Link
            href="/volunteer/nearby"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
          >
            Find requests near you
          </Link>
        }
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            href={`/volunteer/tasks/${task.id}`}
            className="flex flex-col gap-2 rounded-2xl border bg-card p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{getTaskTitle(task)}</span>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(task.acceptedAt ?? task.createdAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{task.sosRequest.victim.name}</p>
            <ReliefBadges categories={task.sosRequest.needs} />
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="task" status={task.status} />
              <PriorityBadge priority={task.sosRequest.priority} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
