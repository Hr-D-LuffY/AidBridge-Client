'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sosKeys } from '@/features/sos/sos.keys'
import {
  type Paginated,
  type SosRequest,
  type Task,
  type TaskListParams,
  type TaskProgressStatus,
  TaskStatus,
} from '@/types'
import { taskApi } from './task.api'
import { taskKeys } from './task.keys'
import { isActiveTaskStatus, TASK_LOOKUP_PARAMS } from './task.params'
import { findTask, SOS_STATUS_FOR_TASK } from './task.view'

// A page of the volunteer's tasks (the history).
export function useTasksQuery(params: TaskListParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: ({ signal }) => taskApi.list(params, signal),
    // Keep showing the old page while the next one loads, so a filter change does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// The tasks being worked (accepted or on the way). Asked for again every `pollMs` (see usePolling), so
// a request the victim closes shows up as cancelled without a reload.
export function useActiveTasksQuery(pollMs: number | false = false) {
  return useQuery({
    queryKey: taskKeys.active(),
    queryFn: ({ signal }) => taskApi.active(signal),
    refetchInterval: pollMs,
  })
}

// One task for its own page. The page prefetched the volunteer's newest 100 tasks (there is no
// GET /tasks/:id), so this reads the same list and picks the task out, and a status change made
// anywhere updates it. While the task is still active it is asked for again every `pollMs`.
export function useTaskQuery(id: string, pollMs: number | false = false) {
  return useQuery({
    queryKey: taskKeys.list(TASK_LOOKUP_PARAMS),
    queryFn: ({ signal }) => taskApi.list(TASK_LOOKUP_PARAMS, signal),
    select: (page) => findTask(page.items, id),
    refetchInterval: (query) => {
      const task = findTask(query.state.data?.items ?? [], id)
      return pollMs && task && isActiveTaskStatus(task.status) ? pollMs : false
    },
  })
}

// What the list caches hold: an array (the active tasks) or a page (any other list).
type TaskCache = Task[] | Paginated<Task>

function patchTask(task: Task, taskId: string, status: TaskProgressStatus): Task {
  if (task.id !== taskId) return task
  return {
    ...task,
    status,
    completedAt: status === TaskStatus.COMPLETED ? new Date().toISOString() : task.completedAt,
    sosRequest: { ...task.sosRequest, status: SOS_STATUS_FOR_TASK[status] },
  }
}

function patchCache(cache: TaskCache, taskId: string, status: TaskProgressStatus): TaskCache {
  if (Array.isArray(cache)) {
    // A finished task leaves "In progress" at once.
    return cache
      .map((task) => patchTask(task, taskId, status))
      .filter((task) => isActiveTaskStatus(task.status))
  }
  return { ...cache, items: cache.items.map((task) => patchTask(task, taskId, status)) }
}

type CacheSnapshot = [readonly unknown[], TaskCache | undefined][]

const STATUS_MESSAGE: Record<TaskProgressStatus, string> = {
  [TaskStatus.ON_THE_WAY]: 'Marked as on the way. The person can see it.',
  [TaskStatus.COMPLETED]: 'Marked as completed. Thank you for helping.',
}

// Moves a task one step. The step shows at once and goes back if the server refuses (a 409 means the
// task changed meanwhile, for example the victim closed the request). Every task list is read again
// afterwards, so what is shown is what the server holds.
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskProgressStatus }) =>
      taskApi.setStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const snapshot: CacheSnapshot = queryClient.getQueriesData<TaskCache>({
        queryKey: taskKeys.all,
      })
      queryClient.setQueriesData<TaskCache>(
        { queryKey: taskKeys.all },
        (current) => current && patchCache(current, taskId, status),
      )
      return { snapshot }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      for (const [key, data] of context.snapshot) queryClient.setQueryData(key, data)
    },
    onSuccess: (_task, { status }) => toast.success(STATUS_MESSAGE[status]),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

// Rates the volunteer on a request. On success the request in the cache is marked as rated, so the
// card turns into a thank-you without waiting for the next poll. The card shows its own error (a 409
// means it was already rated, for example from another device).
export function useRateTask(sosId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, score }: { taskId: string; score: number }) =>
      taskApi.rate(taskId, score),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      queryClient.setQueryData<SosRequest>(sosKeys.detail(sosId), (current) =>
        current?.task
          ? { ...current, task: { ...current.task, isRated: true, canRate: false } }
          : current,
      )
      toast.success('Thank you. Your rating helps other people choose who to trust.')
    },
    // A 409 or 403 can mean the state changed elsewhere, so read the request again either way.
    onSettled: () => queryClient.invalidateQueries({ queryKey: sosKeys.detail(sosId) }),
  })
}
