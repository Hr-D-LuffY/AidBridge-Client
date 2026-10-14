import { DEFAULT_PAGE, MAX_PAGE_SIZE, TASK_HISTORY_PAGE_SIZE } from '@/lib/constants'
import { type TaskListParams, TaskStatus } from '@/types'

// A task being worked. A volunteer holds at most MAX_ACTIVE_TASKS of these at once.
export const ACTIVE_TASK_STATUSES = [TaskStatus.ACCEPTED, TaskStatus.ON_THE_WAY] as const

export function isActiveTaskStatus(status: TaskStatus): boolean {
  return ACTIVE_TASK_STATUSES.some((active) => active === status)
}

// The history lists one kind of ended task at a time (the backend filters by a single status), so a
// task that is still active never shows up twice: it is in "In progress" above.
export const HISTORY_STATUSES = [
  TaskStatus.COMPLETED,
  TaskStatus.REJECTED,
  TaskStatus.CANCELLED,
] as const
export type HistoryStatus = (typeof HISTORY_STATUSES)[number]

export const HISTORY_OPTIONS: readonly { value: HistoryStatus; label: string }[] = [
  { value: TaskStatus.COMPLETED, label: 'Completed' },
  { value: TaskStatus.REJECTED, label: 'Declined' },
  { value: TaskStatus.CANCELLED, label: 'Cancelled' },
]

export type TaskHistoryView = {
  page: number
  status: HistoryStatus
}

// The URL is the source of truth for the history, so each value is checked: a hand-edited
// ?status=nope falls back to "Completed" instead of reaching the backend as a 400.
export function parseTaskHistoryParams(raw: { page?: string; status?: string }): TaskHistoryView {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    status: HISTORY_STATUSES.find((status) => status === raw.status) ?? TaskStatus.COMPLETED,
  }
}

export function toHistoryQuery(view: TaskHistoryView): TaskListParams {
  return { status: view.status, page: view.page, limit: TASK_HISTORY_PAGE_SIZE }
}

// There is no GET /tasks/:id, so a task's own page reads the volunteer's newest 100 tasks and picks
// the one it needs. Active tasks are always among the newest.
export const TASK_LOOKUP_PARAMS: TaskListParams = { limit: MAX_PAGE_SIZE }
