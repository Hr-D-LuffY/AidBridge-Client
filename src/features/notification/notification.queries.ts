'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  AppNotification,
  CreateNotificationPayload,
  NotificationListParams,
  Paginated,
  PaginationParams,
} from '@/types'
import { notificationApi } from './notification.api'
import { notificationKeys } from './notification.keys'

// `pollMs` comes from usePolling(), so a hidden tab sends nothing.
export function useNotificationsQuery(params: NotificationListParams, pollMs: number | false) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: ({ signal }) => notificationApi.list(params, signal),
    refetchInterval: pollMs,
    // Keep showing the old page while the next one loads.
    placeholderData: keepPreviousData,
  })
}

// A page of the admin's broadcast history. The page is in the URL, so a change keeps the old rows on
// screen until the new ones arrive.
export function useBroadcastsQuery(params: PaginationParams) {
  return useQuery({
    queryKey: notificationKeys.broadcasts(params),
    queryFn: ({ signal }) => notificationApi.broadcasts(params, signal),
    placeholderData: keepPreviousData,
  })
}

// The number on the bell. `pollMs` comes from usePolling(), so a hidden tab sends nothing. Errors are
// silent: a toast every 30 seconds while the connection is down would only be noise.
export function useUnreadCountQuery(pollMs: number | false) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: ({ signal }) => notificationApi.unreadCount(signal).then((result) => result.count),
    refetchInterval: pollMs,
    meta: { skipGlobalError: true },
  })
}

type ListSnapshot = [readonly unknown[], Paginated<AppNotification> | undefined][]

// Marks one notification as read at once and puts it back if the server refuses. The bell number goes
// down with it. Reading an already-read one is harmless, so the page only offers the button on unread ones.
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notification: AppNotification) => notificationApi.markRead(notification.id),
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const lists: ListSnapshot = queryClient.getQueriesData<Paginated<AppNotification>>({
        queryKey: notificationKeys.lists(),
      })
      const count = queryClient.getQueryData<number>(notificationKeys.unreadCount())

      queryClient.setQueriesData<Paginated<AppNotification>>(
        { queryKey: notificationKeys.lists() },
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) =>
              item.id === notification.id ? { ...item, isRead: true } : item,
            ),
          },
      )
      if (count !== undefined && !notification.isRead) {
        queryClient.setQueryData(notificationKeys.unreadCount(), Math.max(0, count - 1))
      }
      return { lists, count }
    },
    onError: (_error, _notification, context) => {
      if (!context) return
      for (const [key, data] of context.lists) queryClient.setQueryData(key, data)
      if (context.count !== undefined) {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.count)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

// Admin: sends a broadcast. The composer shows its own errors, so the global toast is off. The history and
// the bell are read again, since the new broadcast joins the history and the admin may be among the
// recipients.
export function useSendBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateNotificationPayload) => notificationApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: (_notification, { isEmergencyBroadcast }) =>
      toast.success(
        isEmergencyBroadcast
          ? 'Emergency broadcast sent. The emails are going out now.'
          : 'Notification sent.',
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
