import { ArrowRight, ExternalLink, MapPinned, Route } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDistance } from '@/lib/format'
import { getDirectionsUrl, type LatLng } from '@/lib/geo'
import { cn } from '@/lib/utils'
import type { FullTask } from '@/types'
import { getTaskDistance } from '../task.map'
import { getTaskTitle } from '../task.view'

type CurrentTasksPanelProps = {
  tasks: FullTask[]
  // Where the volunteer is now, to measure from. Null until it is known.
  origin: LatLng | null
  selectedId: string | null
  onShowOnMap: (taskId: string) => void
}

// The requests the volunteer has taken, above the map of requests to take: how far each person still is
// from where the volunteer is now (straight line, and a directions link for the road), and a way to find
// them on the map. Without it a volunteer deep in the nearby list would have to leave to remember where
// they are going.
export function CurrentTasksPanel({
  tasks,
  origin,
  selectedId,
  onShowOnMap,
}: CurrentTasksPanelProps) {
  if (tasks.length === 0) return null

  return (
    <section
      aria-labelledby="current-tasks-heading"
      className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-sidebar-accent p-3 sm:p-4 lg:sticky lg:top-24"
    >
      <h2 id="current-tasks-heading" className="text-base">
        Your current {tasks.length === 1 ? 'task' : 'tasks'}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {tasks.map((task) => {
          const distance = getTaskDistance(task, origin)
          return (
            <li
              key={task.id}
              className={cn(
                'flex flex-col gap-2 rounded-xl border bg-card p-3',
                selectedId === `task-${task.id}` && 'border-primary ring-2 ring-primary/30',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge kind="task" status={task.status} />
                <p className="flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                  <Route aria-hidden="true" className="size-4 text-muted-foreground" />
                  {distance !== null ? (
                    <span>{formatDistance(distance)} away</span>
                  ) : (
                    <span className="font-normal text-muted-foreground">
                      Finding your position…
                    </span>
                  )}
                </p>
              </div>
              <p className="font-semibold text-balance">{getTaskTitle(task)}</p>
              <p className="text-sm text-muted-foreground">
                {task.sosRequest.victim.name}
                {distance !== null && ' · straight-line distance, the road is longer'}
              </p>
              <div className="mt-auto flex flex-wrap gap-x-4">
                <a
                  href={getDirectionsUrl(task.sosRequest.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  Directions
                  <span className="sr-only"> to {getTaskTitle(task)} (opens in a new tab)</span>
                </a>
                <button
                  type="button"
                  onClick={() => onShowOnMap(`task-${task.id}`)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <MapPinned aria-hidden="true" className="size-4" />
                  Show on map
                </button>
                <Link
                  href={`/volunteer/tasks/${task.id}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Open task
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
