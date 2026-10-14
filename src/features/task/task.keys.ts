import type { TaskListParams } from '@/types'

// One key factory for every task query. Plain module: the server pages import it too.
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  // The tasks being worked right now (accepted or on the way), at most three.
  active: () => [...taskKeys.all, 'active'] as const,
}
