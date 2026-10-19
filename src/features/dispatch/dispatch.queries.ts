'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sosKeys } from '@/features/sos/sos.keys'
import type {
  AssignPayload,
  CandidatesParams,
  DispatchRunOutcome,
  SosRequest,
  UnassignPayload,
  UpdateDispatchSettingsPayload,
} from '@/types'
import { dispatchApi } from './dispatch.api'
import { dispatchKeys } from './dispatch.keys'

export function useDispatchSettingsQuery() {
  return useQuery({
    queryKey: dispatchKeys.settings(),
    queryFn: ({ signal }) => dispatchApi.settings(signal),
  })
}

// Saves some settings. The form shows a 400 under its fields and the page explains a 409 (another admin
// saved first), so the global toast is off. The answer replaces the cache, so the form starts from what the
// server now holds.
export function useUpdateDispatchSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateDispatchSettingsPayload) => dispatchApi.updateSettings(payload),
    meta: { skipGlobalError: true },
    onSuccess: (result) => queryClient.setQueryData(dispatchKeys.settings(), result),
    onError: () => queryClient.invalidateQueries({ queryKey: dispatchKeys.settings() }),
  })
}

// The ranked volunteers for one request. Only asked for while the assign sheet is open; a radius change
// keeps the old rows on screen until the new ones arrive.
export function useCandidatesQuery(sosId: string, params: CandidatesParams, enabled: boolean) {
  return useQuery({
    queryKey: dispatchKeys.candidates(sosId, params),
    queryFn: ({ signal }) => dispatchApi.candidates(sosId, params, signal),
    enabled,
    placeholderData: keepPreviousData,
  })
}

// Every control answers with the request in the staff view. It replaces the request in the cache, and the
// lists, the candidates and the timeline are read again, because who holds the request just changed.
function useSyncStaffSos(sosId: string) {
  const queryClient = useQueryClient()
  return (sos: SosRequest) => {
    queryClient.setQueryData(sosKeys.detail(sosId), sos)
    queryClient.invalidateQueries({ queryKey: sosKeys.lists() })
    queryClient.invalidateQueries({ queryKey: sosKeys.timeline(sosId) })
    queryClient.invalidateQueries({ queryKey: dispatchKeys.candidatesFor(sosId) })
  }
}

// Offers the request to a volunteer, or assigns it to them at once (`direct`). A 409 (off duty, three
// tasks, the request was taken meanwhile) shows the backend's reason in the global toast.
export function useAssignSos(sosId: string) {
  const queryClient = useQueryClient()
  const sync = useSyncStaffSos(sosId)
  return useMutation({
    mutationFn: (payload: AssignPayload & { name: string }) =>
      dispatchApi.assign(sosId, { volunteerId: payload.volunteerId, direct: payload.direct }),
    onSuccess: (sos, { name, direct }) => {
      sync(sos)
      toast.success(direct ? `${name} was assigned this request.` : `Offer sent to ${name}.`)
    },
    // Whatever went wrong (the volunteer went off duty, the request was taken), what the sheet shows may
    // be out of date, so the candidates and the request are read again.
    onError: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.candidatesFor(sosId) })
      queryClient.invalidateQueries({ queryKey: sosKeys.detail(sosId) })
    },
  })
}

// Takes the request back from its volunteer.
export function useUnassignSos(sosId: string) {
  const sync = useSyncStaffSos(sosId)
  return useMutation({
    mutationFn: (payload: UnassignPayload) => dispatchApi.unassign(sosId, payload),
    onSuccess: (sos, { pause }) => {
      sync(sos)
      toast.success(
        pause
          ? 'Request taken back. Automatic dispatch is paused for it.'
          : 'Request taken back. It is open to other volunteers again.',
      )
    },
  })
}

const RUN_MESSAGE: Record<DispatchRunOutcome, string> = {
  offered: 'Offers were sent to nearby volunteers.',
  waiting: 'Offers are still out, so nothing more was done yet.',
  nobody: 'No volunteer is in reach. The search was widened.',
}

// Runs the next dispatch step now, skipping the wait.
export function useRunDispatch(sosId: string) {
  const sync = useSyncStaffSos(sosId)
  return useMutation({
    mutationFn: () => dispatchApi.runNow(sosId),
    onSuccess: (result) => {
      sync(result.sosRequest)
      toast.success(RUN_MESSAGE[result.outcome])
    },
  })
}

export function usePauseDispatch(sosId: string) {
  const sync = useSyncStaffSos(sosId)
  return useMutation({
    mutationFn: (pause: boolean) => (pause ? dispatchApi.pause(sosId) : dispatchApi.resume(sosId)),
    onSuccess: (sos, pause) => {
      sync(sos)
      toast.success(
        pause ? 'Automatic dispatch paused for this request.' : 'Automatic dispatch resumed.',
      )
    },
  })
}
