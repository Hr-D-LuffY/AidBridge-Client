'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sosKeys } from '@/features/sos/sos.keys'
import { getErrorMessage } from '@/lib/api/errors'
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
import { classifyOfferFailure, OFFER_FAILURE_TEXT } from './task.offer'
import { isActiveTaskStatus } from './task.params'
import { SOS_STATUS_FOR_TASK } from './task.view'

// A page of the volunteer's tasks (the history).
export function useTasksQuery(params: TaskListParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: ({ signal }) => taskApi.list(params, signal),
    // Keep showing the old page while the next one loads, so a filter change does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// The offers waiting for the volunteer's answer, with the server-clock offset the countdown needs. Asked
// for again every `pollMs` (see usePolling), so a new offer shows up and an old one drops off by itself.
export function useOffersQuery(pollMs: number | false = false) {
  return useQuery({
    queryKey: taskKeys.offers(),
    queryFn: ({ signal }) => taskApi.offers(signal),
    refetchInterval: pollMs,
  })
}

// Accepts or declines an offer. A 409 is explained kindly (it ran out, someone was first, three tasks) and
// the lists are read again either way, so what is shown is what the server holds. The caller moves on to
// the new task when an accept succeeds.
export function useRespondToOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, action }: { taskId: string; action: 'accept' | 'reject' }) =>
      taskApi.respond(taskId, action),
    meta: { skipGlobalError: true },
    onSuccess: (_task, { action }) => {
      toast.success(
        action === 'accept'
          ? 'Offer accepted. Their phone number and exact location are now yours.'
          : 'Offer declined. You will not see this request again.',
      )
    },
    onError: (error) => {
      const failure = classifyOfferFailure(error)
      const { title, description } = OFFER_FAILURE_TEXT[failure]
      toast.error(title, {
        description: failure === 'other' ? getErrorMessage(error) : description,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.offers() })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: sosKeys.nearbyLists() })
    },
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

// One task for its own page (GET /tasks/:id, by the task's id). The server page has already loaded it, and
// a status change made anywhere updates it. While the task is still active it is asked for again every
// `pollMs`.
export function useTaskQuery(id: string, pollMs: number | false = false) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: ({ signal }) => taskApi.get(id, signal),
    refetchInterval: (query) => {
      const task = query.state.data
      return pollMs && task && isActiveTaskStatus(task.status) ? pollMs : false
    },
  })
}

// What the task caches hold: one task (its own page), an array (the active tasks) or a page (any other
// list).
type TaskCache = Task | Task[] | Paginated<Task>

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
  if ('items' in cache) {
    return { ...cache, items: cache.items.map((task) => patchTask(task, taskId, status)) }
  }
  return patchTask(cache, taskId, status)
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
