import { isApiError } from '@/lib/api/errors'
import type { Task, TaskOffer } from '@/types'

// An offer is a task in status `pending` that carries an `offer`. The countdown runs on the server's
// clock: the offsets below come from the `Date` header of the answer, so a device with a wrong clock does
// not show a dead offer as live. The server still decides (a 409 on respond).

export type OfferTask = Task & { offer: TaskOffer }

export function hasOffer(task: Task): task is OfferTask {
  return task.offer !== null
}

// Milliseconds left on an offer, never below zero. `clockOffsetMs` is server time minus device time.
export function getOfferRemainingMs(
  offer: TaskOffer,
  nowMs: number,
  clockOffsetMs: number,
): number {
  return Math.max(0, Date.parse(offer.expiresAt) - (nowMs + clockOffsetMs))
}

// "4:32", or "0:09" in the last seconds. Whole seconds, rounded up so "0:00" only shows when it is over.
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// The last minute is the one that needs a nudge.
export const OFFER_URGENT_MS = 60_000

export type OfferFailure = 'expired' | 'taken' | 'busy' | 'other'

// Why a respond call was refused (409), from the backend's message: the offer ran out, someone else took
// the request first (the task is then cancelled), or the volunteer already holds three tasks.
export function classifyOfferFailure(error: unknown): OfferFailure {
  if (!isApiError(error) || !error.isConflict) return 'other'
  if (/expired/i.test(error.message)) return 'expired'
  if (/cancelled/i.test(error.message)) return 'taken'
  if (/active tasks|3 active|three/i.test(error.message)) return 'busy'
  return 'other'
}

export const OFFER_FAILURE_TEXT: Record<OfferFailure, { title: string; description?: string }> = {
  expired: {
    title: 'This offer ran out of time',
    description: 'If the request is still open you can find it on your map and take it from there.',
  },
  taken: {
    title: 'Someone else took this request first',
    description: 'Thank you for being ready to help. The list was refreshed.',
  },
  busy: {
    title: 'You already have three active tasks',
    description: 'Finish or back out of one to take another.',
  },
  other: { title: 'We could not send your answer' },
}
