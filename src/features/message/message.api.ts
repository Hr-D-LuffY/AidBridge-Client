import { clientApi } from '@/lib/api/client'
import type { ChatMessage, PaginationParams } from '@/types'

// The chat of one SOS request (the victim, the assigned volunteer, and admins who may only read).
export const messageApi = {
  // Newest first: page 1 is the latest. The chat panel reverses it.
  list: (sosId: string, params: PaginationParams, signal?: AbortSignal) =>
    clientApi.getList<ChatMessage>(`/sos/${sosId}/messages`, params, signal),
  send: (sosId: string, content: string) =>
    clientApi.post<ChatMessage>(`/sos/${sosId}/messages`, { content }),
}
