'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import {
  type CreateSosPayload,
  type SosListParams,
  type SosRequest,
  SosStatus,
  type UpdateSosPayload,
} from '@/types'
import { sosApi } from './sos.api'
import { sosKeys } from './sos.keys'

export function useSosListQuery(params: SosListParams) {
  return useQuery({
    queryKey: sosKeys.list(params),
    queryFn: ({ signal }) => sosApi.list(params, signal),
    // Keep showing the old page while the next one loads, so a filter change does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// A rescued or closed request cannot change any more.
export const isSosFinished = (status: SosStatus) =>
  status === SosStatus.RESCUED || status === SosStatus.CLOSED

// One request. The server page has already loaded it. While a volunteer may still be working on it,
// it is asked for again every `pollMs` (see usePolling), so the status moves on without a reload.
export function useSosQuery(id: string, pollMs: number | false = false) {
  return useQuery({
    queryKey: sosKeys.detail(id),
    queryFn: ({ signal }) => sosApi.get(id, signal),
    refetchInterval: (query) => {
      const sos = query.state.data
      return pollMs && sos && !isSosFinished(sos.status) ? pollMs : false
    },
  })
}

// After a change, the request in the cache is replaced by the answer and every list is refetched
// (its status, priority or needs may have changed what the list shows).
function useSyncSos() {
  const queryClient = useQueryClient()
  return (sos: SosRequest) => {
    queryClient.setQueryData(sosKeys.detail(sos.id), sos)
    queryClient.invalidateQueries({ queryKey: sosKeys.lists() })
  }
}

type CreateSosInput = {
  payload: CreateSosPayload
  files: File[]
  onProgress: (percent: number) => void
}

export type CreateSosResult = {
  sos: SosRequest
  // Set when the request was saved but the photos were not: the request is not lost, and the
  // detail page lets the victim add them again.
  mediaError: string | null
}

function describeMediaError(error: unknown) {
  if (isApiError(error) && error.status === 503) {
    return 'photo upload is not set up on the server yet'
  }
  return getErrorMessage(error)
}

// Two calls in one: POST /sos, then the files (they need the request's id). The form shows its own
// errors, so the global toast is off.
export function useCreateSos() {
  const syncSos = useSyncSos()
  return useMutation({
    mutationFn: async ({
      payload,
      files,
      onProgress,
    }: CreateSosInput): Promise<CreateSosResult> => {
      const created = await sosApi.create(payload)
      if (files.length === 0) return { sos: created, mediaError: null }
      try {
        return { sos: await sosApi.addMedia(created.id, files, onProgress), mediaError: null }
      } catch (error) {
        return { sos: created, mediaError: describeMediaError(error) }
      }
    },
    meta: { skipGlobalError: true },
    onSuccess: ({ sos }) => syncSos(sos),
  })
}

export function useUpdateSos(id: string) {
  const syncSos = useSyncSos()
  return useMutation({
    mutationFn: (payload: UpdateSosPayload) => sosApi.update(id, payload),
    onSuccess: (sos) => {
      syncSos(sos)
      toast.success('Request updated. The volunteer on it has been told.')
    },
  })
}

export function useAddSosMedia(id: string) {
  const syncSos = useSyncSos()
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress: (percent: number) => void }) =>
      sosApi.addMedia(id, files, onProgress),
    meta: { skipGlobalError: true },
    onSuccess: (sos) => {
      syncSos(sos)
      toast.success('Added to your request.')
    },
  })
}

export function useRemoveSosMedia(id: string) {
  const syncSos = useSyncSos()
  return useMutation({
    mutationFn: (mediaId: string) => sosApi.update(id, { removeMediaIds: [mediaId] }),
    onSuccess: (sos) => {
      syncSos(sos)
      toast.success('Removed.')
    },
  })
}

export function useResolveSos(id: string) {
  const syncSos = useSyncSos()
  return useMutation({
    mutationFn: (reason: string) => sosApi.resolve(id, reason),
    onSuccess: (sos) => {
      syncSos(sos)
      toast.success('Your request is closed.')
    },
  })
}
