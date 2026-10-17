import { clientApi } from '@/lib/api/client'
import { MAX_ACTIVE_TASKS } from '@/lib/constants'
import type { FullTask, RateTaskResult, Task, TaskListParams, TaskProgressStatus } from '@/types'
import { ACTIVE_TASK_STATUSES } from './task.params'
import { mergeActiveTasks } from './task.view'

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
  // accepted -> on_the_way -> completed. Any other jump is a 409.
  setStatus: (taskId: string, status: TaskProgressStatus) =>
    clientApi.put<Task>(`/tasks/${taskId}/status`, { status }),
  // The victim of a completed task rates its volunteer: a whole number of stars, once.
  rate: (taskId: string, score: number) =>
    clientApi.post<RateTaskResult>(`/tasks/${taskId}/rate`, { score }),
}
