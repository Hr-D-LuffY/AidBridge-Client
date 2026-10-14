import type { PaginationParams } from './api'
import type { TaskStatus } from './enums'
import type { SosRequest, SosView } from './sos'

// POST /tasks/:id/rate: the volunteer's new running average after a rating.
export type RateTaskResult = {
  taskId: string
  isRated: boolean
  volunteer: { id: string; reliabilityScore: number; totalRatings: number }
}

// One of the volunteer's tasks (GET /tasks, PUT /tasks/:id/status). The request inside it is the full
// view once the task is accepted, on the way or completed, and the limited one otherwise.
export type Task = {
  id: string
  status: TaskStatus
  acceptedAt: string | null
  completedAt: string | null
  notes: string | null
  isRated: boolean
  sosRequest: SosView
  createdAt: string
  updatedAt: string
}

// A task whose request carries the victim's phone and exact position: what the volunteer works from.
export type FullTask = Task & { sosRequest: SosRequest }

export type TaskListParams = PaginationParams & {
  status?: TaskStatus
}

// The two steps a volunteer sets with PUT /tasks/:id/status. Accepting happens on the request itself.
export type TaskProgressStatus = Extract<TaskStatus, 'on_the_way' | 'completed'>

// PUT /sos/:id/accept: the request is now the volunteer's, in its full view, with the new task.
export type AcceptSosResult = {
  sosRequest: SosRequest
  task: Task
}
