import type { CandidatesParams } from '@/types'

// One key factory for every dispatch query. Plain module: the server pages import it too.
export const dispatchKeys = {
  all: ['dispatch'] as const,
  settings: () => [...dispatchKeys.all, 'settings'] as const,
  // The volunteers the engine could pick for one request, at a radius and page.
  candidatesFor: (sosId: string) => [...dispatchKeys.all, 'candidates', sosId] as const,
  candidates: (sosId: string, params: CandidatesParams) =>
    [...dispatchKeys.candidatesFor(sosId), params] as const,
}
