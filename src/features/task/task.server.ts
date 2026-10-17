import 'server-only'
import { serverApi } from '@/lib/api/server'
import { MAX_ACTIVE_TASKS } from '@/lib/constants'
import type { FullTask, Paginated, Task, TaskListParams, TaskStatus } from '@/types'
import { ACTIVE_TASK_STATUSES } from './task.params'
import { mergeActiveTasks } from './task.view'

// The same endpoints for Server Components, which call the backend directly.
export function getTaskPage(params: TaskListParams): Promise<Paginated<Task>> {
  return serverApi.getList<Task>('/tasks', params)
}

// One of my own tasks (GET /tasks/:id).
export function getTask(id: string): Promise<Task> {
  return serverApi.get<Task>(`/tasks/${id}`)
}

// The tasks being worked: one request per status, merged (see taskApi.active).
export async function getActiveTasks(): Promise<FullTask[]> {
  const pages = await Promise.all(
    ACTIVE_TASK_STATUSES.map((status) => getTaskPage({ status, limit: MAX_ACTIVE_TASKS })),
  )
  return mergeActiveTasks(pages.map((page) => page.items))
}

// How many of my tasks have this status (only the `meta.total` is read).
export async function countTasks(status: TaskStatus): Promise<number> {
  const { meta } = await getTaskPage({ status, limit: 1 })
  return meta.total
}
