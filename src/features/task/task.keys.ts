import type { TaskListParams } from '@/types'

// One key factory for every task query. Plain module: the server pages import it too.
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  // One task, for its own page.
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  // The tasks being worked right now (accepted or on the way), at most three.
  active: () => [...taskKeys.all, 'active'] as const,
  // Offers waiting for an answer. A root of its own: they are not tasks being worked, and the task
  // caches are patched by status steps that must not touch them.
  offers: () => ['offers'] as const,
}
