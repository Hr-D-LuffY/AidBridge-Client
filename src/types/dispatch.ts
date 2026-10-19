import type { Priority, Skill } from './enums'
import type { SosRequest } from './sos'

// What the dispatch engine knows about one request. Only admins and NGOs get it (API.md 12d); a victim
// or a volunteer never sees it.
export type DispatchState = {
  // Rounds that ended without anyone accepting.
  level: number
  // When the engine next looks at the request; null before its first look.
  nextActionAt: string | null
  // The engine gave up finding someone (it still retries).
  unserved: boolean
  // The priority shown was raised by the engine.
  priorityBumped: boolean
  // An admin stopped automatic offers for this request.
  paused: boolean
}

// GET/PUT /dispatch/settings (admin). Minutes unless the name says otherwise.
export type DispatchSettings = {
  // The kill switch: off stops new offers, widening and set-off checks. Offers already out still expire.
  enabled: boolean
  waitMinutes: Record<Priority, number>
  volunteersPerRound: number
  offerWindowMinutes: number
  criticalOfferWindowMinutes: number
  startRadiusKm: number
  radiusFactor: number
  maxRadiusKm: number
  maxRounds: number
  retryIntervalMinutes: number
  setOffWithinMinutes: number
  criticalSetOffWithinMinutes: number
  // Each 0-1; the five add up to 1.
  weights: {
    distance: number
    reliability: number
    load: number
    skillMatch: number
    noShowPenalty: number
  }
}

type Range = { min: number; max: number }

// The bounds the backend enforces, so the form can mirror them.
export type DispatchLimits = {
  waitMinutes: Range
  offerWindowMinutes: Range
  radiusKm: Range
  radiusFactor: Range
  volunteersPerRound: Range
  maxRounds: Range
  retryIntervalMinutes: Range
  setOffWithinMinutes: Range
  weight: Range
}

export type DispatchSettingsResult = {
  settings: DispatchSettings
  // What "Reset to defaults" sends.
  defaults: DispatchSettings
  limits: DispatchLimits
  updatedAt: string
}

// PUT /dispatch/settings takes only what changes. A nested block may be sent in part, except the weights,
// which must add up to 1 once merged, so the form always sends all five.
export type UpdateDispatchSettingsPayload = {
  enabled?: boolean
  waitMinutes?: Partial<Record<Priority, number>>
  volunteersPerRound?: number
  offerWindowMinutes?: number
  criticalOfferWindowMinutes?: number
  startRadiusKm?: number
  radiusFactor?: number
  maxRadiusKm?: number
  maxRounds?: number
  retryIntervalMinutes?: number
  setOffWithinMinutes?: number
  criticalSetOffWithinMinutes?: number
  weights?: Partial<DispatchSettings['weights']>
}

// Each part of the rank is 0-1, higher is better; `noShow` is a penalty.
export type ScoreParts = {
  distance: number
  reliability: number
  load: number
  skillMatch: number
  noShow: number
}

// One volunteer the engine could pick for a request (GET /sos/:id/candidates), best first.
export type DispatchCandidate = {
  rank: number
  volunteer: { id: string; name: string; phone: string | null }
  distanceMeters: number
  // The weighted total the engine uses, 0-1.
  score: number
  scoreParts: ScoreParts
  activeTasks: number
  noShowCount: number
  reliabilityScore: number
  skills: Skill[]
  matchedSkills: Skill[]
  languages: string[]
}

export type CandidatesParams = {
  radiusKm?: number
  page?: number
  limit?: number
}

// PUT /sos/:id/assign. An offer by default; `direct` gives the request to the volunteer at once.
export type AssignPayload = {
  volunteerId: string
  direct?: boolean
}

// PUT /sos/:id/unassign. `pause` also stops automatic offers in the same write.
export type UnassignPayload = {
  reason?: string
  pause?: boolean
}

// POST /sos/:id/dispatch: what running the next step now came to.
export type DispatchRunOutcome = 'offered' | 'waiting' | 'nobody'

export type DispatchRunResult = {
  outcome: DispatchRunOutcome
  offered: number
  sosRequest: SosRequest
}
