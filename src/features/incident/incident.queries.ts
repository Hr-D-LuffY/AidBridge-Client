'use client'

import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { INCIDENT_LOOKUP_PARAMS } from './incident.params'

// A page of incidents. The filters and page live in the URL, so a change keeps the old rows on screen
// until the new ones arrive.
export function useIncidentsQuery(params: IncidentListParams) {
  return useQuery({
    queryKey: incidentKeys.list(params),
    queryFn: ({ signal }) => incidentApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

// One incident for its own page. There is no GET /incidents/:id, so the page prefetched the newest 100
// and this picks the incident out; any change made anywhere updates it.
export function useIncidentQuery(id: string) {
  return useQuery({
    queryKey: incidentKeys.list(INCIDENT_LOOKUP_PARAMS),
    queryFn: ({ signal }) => incidentApi.list(INCIDENT_LOOKUP_PARAMS, signal),
    select: (page) => page.items.find((incident) => incident.id === id),
  })
}

// The ids of the requests linked to an incident, as the last link or unlink answer reported them
// (undefined until one has happened in this browser: the backend does not list them otherwise).
export function useLinkedRequestIds(id: string) {
  return useQuery<string[]>({
    queryKey: incidentKeys.links(id),
    queryFn: skipToken,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })
}

function useRefreshIncidents() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: incidentKeys.lists() })
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

export function useDeleteIncident(id: string) {
  const refresh = useRefreshIncidents()
  return useMutation({
    mutationFn: () => incidentApi.remove(id),
    onSuccess: () => toast.success('Incident deleted.'),
    onSettled: refresh,
  })
}

// Links or unlinks requests. The answer lists the ids linked now, which is the only time the backend
// does, so it is kept for the incident's page. The sheet shows its own errors (an unknown id is a 400).
export function useLinkRequests(id: string) {
  const queryClient = useQueryClient()
  const refresh = useRefreshIncidents()
  return useMutation({
    mutationFn: ({ action, ids }: { action: SosLinkAction; ids: string[] }) =>
      incidentApi.linkRequests(id, action, ids),
    meta: { skipGlobalError: true },
    onSuccess: (incident, { action, ids }) => {
      if (incident.sosRequests)
        queryClient.setQueryData(incidentKeys.links(id), incident.sosRequests)
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
