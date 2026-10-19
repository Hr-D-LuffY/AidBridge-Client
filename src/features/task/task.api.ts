import { clientApi } from '@/lib/api/client'
import { MAX_ACTIVE_TASKS } from '@/lib/constants'
import {
  type FullTask,
  type RateTaskResult,
  type Task,
  type TaskListParams,
  type TaskProgressStatus,
  TaskStatus,
} from '@/types'
import { hasOffer, type OfferTask } from './task.offer'
import { ACTIVE_TASK_STATUSES } from './task.params'
import { mergeActiveTasks } from './task.view'

// A volunteer is offered a few requests at once (3 per round), so one page holds them all.
const OFFERS_LIMIT = 20

export type OffersResult = {
  offers: OfferTask[]
  // Server time minus device time, from the answer's Date header (0 when it is missing).
  clockOffsetMs: number
}

const list = (params: TaskListParams, signal?: AbortSignal) =>
  clientApi.getList<Task>('/tasks', params, signal)

// One function per endpoint, for the browser (through the BFF). Server pages use task.server.ts.
export const taskApi = {
  list,
  // One of my own tasks, by the task's id (404 unknown, 403 someone else's).
  get: (id: string, signal?: AbortSignal) => clientApi.get<Task>(`/tasks/${id}`, undefined, signal),
  // The tasks being worked: one request per status, merged. A volunteer holds three at most, so one
  // page of three per status always holds them all.
  active: async (signal?: AbortSignal): Promise<FullTask[]> => {
    const pages = await Promise.all(
      ACTIVE_TASK_STATUSES.map((status) => list({ status, limit: MAX_ACTIVE_TASKS }, signal)),
    )
    return mergeActiveTasks(pages.map((page) => page.items))
  },
  // Requests offered to me by the dispatch engine, an admin or an NGO and not answered yet.
  offers: async (signal?: AbortSignal): Promise<OffersResult> => {
    const result = await clientApi.request<Task[]>('/tasks', {
      query: { status: TaskStatus.PENDING, limit: OFFERS_LIMIT },
      signal,
    })
    return {
      offers: result.data.filter(hasOffer),
      clockOffsetMs: result.serverTime === null ? 0 : result.serverTime - Date.now(),
    }
  },
  // Answers an offer. Accepting answers with the task (now accepted, the request in its full view); a
  // 409 means the offer expired, someone else took the request, or I hold three tasks.
  respond: (taskId: string, action: 'accept' | 'reject') =>
    clientApi.put<Task>(`/tasks/${taskId}/respond`, { action }),
  // accepted -> on_the_way -> completed. Any other jump is a 409.
  setStatus: (taskId: string, status: TaskProgressStatus) =>
    clientApi.put<Task>(`/tasks/${taskId}/status`, { status }),
  // The victim of a completed task rates its volunteer: a whole number of stars, once.
  rate: (taskId: string, score: number) =>
    clientApi.post<RateTaskResult>(`/tasks/${taskId}/rate`, { score }),
}
