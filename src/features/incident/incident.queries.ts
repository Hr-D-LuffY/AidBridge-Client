'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sosKeys } from '@/features/sos/sos.keys'
import {
  type CreateIncidentPayload,
  type IncidentListParams,
  IncidentStatus,
  type Priority,
  SosLinkAction,
  type UpdateIncidentPayload,
} from '@/types'
import { incidentApi } from './incident.api'
import { incidentKeys } from './incident.keys'

// A page of incidents. The filters and page live in the URL, so a change keeps the old rows on screen
// until the new ones arrive.
export function useIncidentsQuery(params: IncidentListParams) {
  return useQuery({
    queryKey: incidentKeys.list(params),
    queryFn: ({ signal }) => incidentApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

// One incident for its own page (GET /incidents/:id). The server page has already loaded it, and any
// change made anywhere reads it again.
export function useIncidentQuery(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: ({ signal }) => incidentApi.get(id, signal),
  })
}

// After a change, the incident's page and every list read it again (the lists show its status, priority
// and counts).
function useRefreshIncidents() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: incidentKeys.all })
}

// The sheet shows its own errors (a field the backend refused), so the global toast is off.
export function useCreateIncident() {
  const refresh = useRefreshIncidents()
  return useMutation({
    mutationFn: (payload: CreateIncidentPayload) => incidentApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: (incident) => toast.success(`${incident.title} was added.`),
    onSettled: refresh,
  })
}

export function useUpdateIncident(id: string) {
  const refresh = useRefreshIncidents()
  return useMutation({
    mutationFn: (payload: UpdateIncidentPayload) => incidentApi.update(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: () => toast.success('Incident saved.'),
    onSettled: refresh,
  })
}

// Resolving stamps today as the end date; reopening clears it.
export function useSetIncidentStatus(id: string) {
  const refresh = useRefreshIncidents()
  return useMutation({
    mutationFn: (status: IncidentStatus) => incidentApi.update(id, { status }),
    onSuccess: (_incident, status) =>
      toast.success(
        status === IncidentStatus.RESOLVED ? 'Incident resolved.' : 'Incident reopened.',
      ),
    onSettled: refresh,
  })
}

export function useSetIncidentPriority(id: string) {
  const refresh = useRefreshIncidents()
  return useMutation({
    mutationFn: (priority: Priority) => incidentApi.setPriority(id, priority),
    onSuccess: () => toast.success('Priority changed.'),
    onSettled: refresh,
  })
}

// The incident's own page is dropped from the cache rather than read again, because it would answer 404.
export function useDeleteIncident(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => incidentApi.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: incidentKeys.detail(id) })
      toast.success('Incident deleted.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: incidentKeys.lists() }),
  })
}

// Links or unlinks requests. The incident (with its counts and linked ids) and the lists of linked requests
// are read again. The sheet shows its own errors (an unknown id is a 400).
export function useLinkRequests(id: string) {
  const queryClient = useQueryClient()
  const refresh = useRefreshIncidents()
  return useMutation({
    mutationFn: ({ action, ids }: { action: SosLinkAction; ids: string[] }) =>
      incidentApi.linkRequests(id, action, ids),
    meta: { skipGlobalError: true },
    onSuccess: (_incident, { action, ids }) => {
      queryClient.invalidateQueries({ queryKey: sosKeys.lists() })
      const count = ids.length
      toast.success(
        action === SosLinkAction.LINK
          ? `${count} ${count === 1 ? 'request' : 'requests'} linked.`
          : `${count} ${count === 1 ? 'request' : 'requests'} unlinked.`,
      )
    },
    onSettled: refresh,
  })
}
