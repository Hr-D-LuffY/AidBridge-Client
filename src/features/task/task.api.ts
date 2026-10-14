import { clientApi } from '@/lib/api/client'
import type { RateTaskResult } from '@/types'

export const taskApi = {
  // The victim of a completed task rates its volunteer: a whole number of stars, once.
  rate: (taskId: string, score: number) =>
    clientApi.post<RateTaskResult>(`/tasks/${taskId}/rate`, { score }),
}
