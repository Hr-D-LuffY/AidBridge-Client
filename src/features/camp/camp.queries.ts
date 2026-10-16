'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { inventoryKeys } from '@/features/inventory/inventory.keys'
import type {
  CampListParams,
  CreateCampPayload,
  ManagedCamp,
  MyCampsParams,
  NearbyCampParams,
  Paginated,
  UpdateCampPayload,
} from '@/types'
import { campApi } from './camp.api'
import { campKeys } from './camp.keys'
import { CAMP_OPTIONS_PARAMS } from './camp.params'

// Camps near a point. `params` is null until the position is known, and the query waits for it.
export function useNearbyCampsQuery(params: NearbyCampParams | null) {
  return useQuery({
    queryKey: campKeys.nearby(params ?? { lng: 0, lat: 0 }),
    queryFn: ({ signal }) => campApi.nearby(params as NearbyCampParams, signal),
    enabled: params !== null,
    // Keep the old camps on screen while a wider radius loads.
    placeholderData: keepPreviousData,
  })
}

// The volunteer's own camps with their stock. Stock changes as hand-outs happen (this volunteer's and
// other volunteers'), so `pollMs` from usePolling() keeps it fresh; the hand-out form reads it too and
// passes `enabled` so nothing is fetched while the form is closed.
export function useMyCampsQuery(
  params: MyCampsParams,
  { pollMs = false, enabled = true }: { pollMs?: number | false; enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: campKeys.mine(params),
    queryFn: ({ signal }) => campApi.mine(params, signal),
    refetchInterval: pollMs,
    enabled,
  })
}

// ---- NGO: the camps it runs --------------------------------------------------------------------

// A page of the NGO's camps. The page lives in the URL, so a new page keeps the old one on screen
// until it arrives.
export function useManagedCampsQuery(params: CampListParams) {
  return useQuery({
    queryKey: campKeys.managed(params),
    queryFn: ({ signal }) => campApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

// Every camp of the NGO, to pick one in a form or a filter. `enabled` keeps a closed form from asking.
export function useCampOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: campKeys.managed(CAMP_OPTIONS_PARAMS),
    queryFn: ({ signal }) => campApi.list(CAMP_OPTIONS_PARAMS, signal),
    enabled,
  })
}

// A camp change shows in the camp lists, and a deleted camp changes the stock that was in it.
function useRefreshCamps() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: campKeys.all })
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
  }
}

// The forms show their own errors (a field the backend refused, a 409), so the global toast is off.
export function useCreateCamp() {
  const refresh = useRefreshCamps()
  return useMutation({
    mutationFn: (payload: CreateCampPayload) => campApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: (camp) => {
      toast.success(`${camp.name} was added.`)
      refresh()
    },
  })
}

export function useUpdateCamp(id: string) {
  const refresh = useRefreshCamps()
  return useMutation({
    mutationFn: (payload: UpdateCampPayload) => campApi.update(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      toast.success('Camp saved.')
      refresh()
    },
  })
}

export function useDeleteCamp() {
  const refresh = useRefreshCamps()
  return useMutation({
    mutationFn: (camp: Pick<ManagedCamp, 'id' | 'name'>) => campApi.remove(camp.id),
    onSuccess: (_result, camp) => toast.success(`${camp.name} was deleted. Its stock was kept.`),
    onSettled: refresh,
  })
}

export function useAssignVolunteer(campId: string) {
  const refresh = useRefreshCamps()
  return useMutation({
    mutationFn: (volunteerId: string) => campApi.assign(campId, volunteerId),
    meta: { skipGlobalError: true },
    onSuccess: () => toast.success('Volunteer assigned to the camp.'),
    onSettled: refresh,
  })
}

export function useUnassignVolunteer(campId: string) {
  const refresh = useRefreshCamps()
  return useMutation({
    mutationFn: (volunteer: { id: string; name: string }) => campApi.unassign(campId, volunteer.id),
    onSuccess: (_camp, volunteer) => toast.success(`${volunteer.name} was taken off the camp.`),
    onSettled: refresh,
  })
}

function patchOccupancy(camp: ManagedCamp, campId: string, delta: number): ManagedCamp {
  if (camp.id !== campId) return camp
  const currentOccupancy = camp.currentOccupancy + delta
  return {
    ...camp,
    currentOccupancy,
    availableSpots: Math.max(camp.capacity - currentOccupancy, 0),
  }
}

const OCCUPANCY_MUTATION_KEY = ['camps', 'occupancy'] as const

// Checks people in (+) or out (-). The count moves at once and goes back if the server refuses (a 409:
// it would pass the capacity or go below zero, or somebody else just changed it). Taps in a row each
// move it; the camps are read again only after the last one has answered, so the number never jumps back
// while a tap is still on its way.
export function useChangeOccupancy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: OCCUPANCY_MUTATION_KEY,
    mutationFn: ({ campId, delta }: { campId: string; delta: number }) =>
      campApi.changeOccupancy(campId, delta),
    onMutate: async ({ campId, delta }) => {
      await queryClient.cancelQueries({ queryKey: campKeys.managedAll() })
      const snapshot = queryClient.getQueriesData<Paginated<ManagedCamp>>({
        queryKey: campKeys.managedAll(),
      })
      queryClient.setQueriesData<Paginated<ManagedCamp>>(
        { queryKey: campKeys.managedAll() },
        (page) =>
          page && { ...page, items: page.items.map((camp) => patchOccupancy(camp, campId, delta)) },
      )
      return { snapshot }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      for (const [key, data] of context.snapshot) queryClient.setQueryData(key, data)
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: OCCUPANCY_MUTATION_KEY }) === 1) {
        queryClient.invalidateQueries({ queryKey: campKeys.managedAll() })
      }
    },
  })
}
