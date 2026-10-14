'use client'

import { ArrowRight, History, Radar } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { ReliefBadges } from '@/components/shared/relief-category'
import { StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePolling } from '@/hooks/use-polling'
import { useQueryParams } from '@/hooks/use-query-params'
import { MAX_ACTIVE_TASKS, POLL_INTERVAL_MS, TASK_HISTORY_PAGE_SIZE } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Task, TaskStatus } from '@/types'
import {
  HISTORY_OPTIONS,
  type HistoryStatus,
  parseTaskHistoryParams,
  toHistoryQuery,
} from '../task.params'
import { useActiveTasksQuery, useTasksQuery } from '../task.queries'
import { getTaskTitle, hasFullSos } from '../task.view'
import { TaskCard } from './task-card'

const EMPTY_HISTORY: Record<HistoryStatus, { title: string; description: string }> = {
  [TaskStatus.COMPLETED]: {
    title: 'No completed tasks yet',
    description: 'Tasks you finish show up here.',
  },
  [TaskStatus.REJECTED]: {
    title: 'No declined tasks',
    description: 'Requests you backed out of show up here.',
  },
  [TaskStatus.CANCELLED]: {
    title: 'No cancelled tasks',
    description: 'A task is cancelled when the person closes their request before you finish.',
  },
}

function CardsSkeleton({ count, height }: { count: number; height: string }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <output className="sr-only">Loading your tasks</output>
      {Array.from({ length: count }, (_, index) => `skeleton-${index}`).map((id) => (
        <Skeleton key={id} className={cn('rounded-2xl', height)} />
      ))}
    </div>
  )
}

function InProgress() {
  const poll = usePolling(POLL_INTERVAL_MS.sosStatus)
  const query = useActiveTasksQuery(poll)
  const tasks = query.data ?? []

  let body: React.ReactNode
  if (query.isPending) {
    body = <CardsSkeleton count={2} height="h-64" />
  } else if (query.isError && !query.data) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (tasks.length === 0) {
    body = (
      <EmptyState
        icon={Radar}
        title="Nothing in progress"
        description="Requests you accept show up here, with what to do next."
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
  } else {
    body = (
      <ul aria-label="Tasks in progress" className="grid gap-4 lg:grid-cols-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="in-progress-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="in-progress-heading" className="text-lg">
          In progress
        </h2>
        {query.data && (
          <p className="text-sm text-muted-foreground">
            {tasks.length} of {MAX_ACTIVE_TASKS} at a time
          </p>
        )}
      </div>
      {body}
    </section>
  )
}

function HistoryRow({ task }: { task: Task }) {
  // Only a completed task keeps the full request. A declined or cancelled one shows the limited view,
  // so there is nothing more to open.
  const details = task.status === TaskStatus.COMPLETED && hasFullSos(task)

  return (
    <li className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge kind="task" status={task.status} />
        <span className="text-sm text-muted-foreground">
          {formatDateTime(task.completedAt ?? task.updatedAt)}
        </span>
      </div>
      <p className="font-semibold">{getTaskTitle(task)}</p>
      <ReliefBadges categories={task.sosRequest.needs} />
      {task.notes && <p className="rounded-xl bg-muted p-3 text-sm">{task.notes}</p>}
      {details && (
        <Link
          href={`/volunteer/tasks/${task.id}`}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          View details
          <ArrowRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> of {getTaskTitle(task)}</span>
        </Link>
      )}
    </li>
  )
}

function Past() {
  const params = useQueryParams()
  const view = parseTaskHistoryParams({ page: params.get('page'), status: params.get('status') })
  const query = useTasksQuery(toHistoryQuery(view))
  const empty = EMPTY_HISTORY[view.status]

  let body: React.ReactNode
  if (query.isPending) {
    body = <CardsSkeleton count={3} height="h-28" />
  } else if (query.isError) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (query.data.items.length === 0) {
    body = <EmptyState icon={History} title={empty.title} description={empty.description} />
  } else {
    body = (
      <>
        <ul aria-label="Earlier tasks" className="flex flex-col gap-3">
          {query.data.items.map((task) => (
            <HistoryRow key={task.id} task={task} />
          ))}
        </ul>
        <PaginationBar
          meta={{ ...query.data.meta, limit: TASK_HISTORY_PAGE_SIZE }}
          onPageChange={params.setPage}
          disabled={query.isFetching}
        />
      </>
    )
  }

  return (
    <section aria-labelledby="history-heading" className="flex flex-col gap-3">
      <h2 id="history-heading" className="text-lg">
        Earlier tasks
      </h2>
      <FilterChips
        label="Show"
        hideAll
        options={HISTORY_OPTIONS}
        value={view.status}
        onChange={(status) => params.set({ status })}
      />
      {body}
    </section>
  )
}

// "My tasks": what the volunteer is working on now, with the next step on each card, and below it the
// tasks that have ended. In progress asks again every 15 seconds, so a request its victim closed
// shows up as cancelled. The history is paged by the server; its filter and page live in the URL.
export function TasksView() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="My tasks"
        description="The requests you have taken. Set off when you leave, finish when it is done, and hand out aid from your camps on the way."
      />
      <InProgress />
      <Past />
    </div>
  )
}
