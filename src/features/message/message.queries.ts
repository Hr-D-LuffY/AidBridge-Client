'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CHAT_PAGE_SIZE } from '@/lib/constants'
import type { ChatMessage, Paginated } from '@/types'
import { messageApi } from './message.api'
import { messageKeys } from './message.keys'

// The latest messages of a request. `pollMs` comes from usePolling(), so a finished conversation or
// a hidden tab sends nothing. Errors are shown in the panel itself: a toast every five seconds while
// the connection is down would bury the page.
export function useMessagesQuery(sosId: string, pollMs: number | false) {
  return useQuery({
    queryKey: messageKeys.list(sosId),
    queryFn: ({ signal }) => messageApi.list(sosId, { limit: CHAT_PAGE_SIZE }, signal),
    refetchInterval: pollMs,
    meta: { skipGlobalError: true },
  })
}

// Sends one message. The answer is added to the top of the cached list (newest first), so it shows
// at once instead of waiting for the next poll. The composer shows its own error (a 409 means the
// request has just been closed).
export function useSendMessage(sosId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => messageApi.send(sosId, content),
    meta: { skipGlobalError: true },
    onSuccess: (message) => {
      queryClient.setQueryData<Paginated<ChatMessage>>(messageKeys.list(sosId), (current) =>
        current
          ? {
              items: [message, ...current.items.filter((item) => item.id !== message.id)],
              meta: { ...current.meta, total: current.meta.total + 1 },
            }
          : current,
      )
    },
  })
}
